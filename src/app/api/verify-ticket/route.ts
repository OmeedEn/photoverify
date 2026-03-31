import { NextRequest, NextResponse } from "next/server";
import { generatePerceptualHash, generateExactHash } from "@/lib/hash";
import {
  findByExactHash,
  findSimilarImages,
  storeImage,
} from "@/lib/store";
import {
  extractQRCode,
  extractBarcode,
  checkDuplicateCode,
  registerCode,
} from "@/lib/barcode";
import type { BarcodeResult } from "@/lib/barcode";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 20, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before verifying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: JPEG, PNG, WebP, GIF, BMP" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract QR code and barcode in parallel
    const [qrData, barcodeData] = await Promise.all([
      extractQRCode(buffer),
      extractBarcode(buffer),
    ]);

    const detectedCode = qrData ?? barcodeData;
    const codeType: BarcodeResult["type"] = qrData
      ? "qr"
      : barcodeData
      ? "barcode"
      : "none";

    // Check for duplicate code
    let barcodeResult: BarcodeResult;
    if (detectedCode) {
      const dupCheck = await checkDuplicateCode(detectedCode);
      barcodeResult = {
        type: codeType,
        data: detectedCode,
        isDuplicate: dupCheck.isDuplicate,
        previousChecks: dupCheck.previousChecks,
        firstSeenAt: dupCheck.firstSeenAt,
      };
      await registerCode(detectedCode);
    } else {
      barcodeResult = {
        type: "none",
        data: null,
        isDuplicate: false,
        previousChecks: 0,
        firstSeenAt: null,
      };
    }

    // Run perceptual hash check for image duplicate detection
    const [exactHash, perceptualHash] = await Promise.all([
      generateExactHash(buffer),
      generatePerceptualHash(buffer),
    ]);

    const exactMatch = await findByExactHash(exactHash);
    const imageId = uuidv4();
    let imageDuplicate = false;

    if (exactMatch) {
      imageDuplicate = true;
    } else {
      await storeImage({
        id: imageId,
        exactHash,
        perceptualHash,
        uploadedAt: new Date().toISOString(),
        reportedAsScam: false,
        matchCount: 0,
      });

      const similar = await findSimilarImages(perceptualHash, imageId);
      if (similar.length > 0) {
        imageDuplicate = true;
      }
    }

    // Calculate trust score and verdict
    let trustScore = 100;
    const reasons: string[] = [];

    if (barcodeResult.type === "none") {
      trustScore = 100;
      reasons.push(
        "No QR code or barcode detected in this image. Upload a clear photo of the ticket code for duplicate checking."
      );
    } else if (barcodeResult.isDuplicate) {
      trustScore = 10;
      reasons.push(
        `Duplicate ticket code detected. This code has been checked ${barcodeResult.previousChecks} time(s) before. First seen on ${new Date(barcodeResult.firstSeenAt!).toLocaleDateString()}.`
      );
    } else {
      trustScore = 100;
      reasons.push(
        "This ticket code has not been seen before. No duplicates found."
      );
    }

    if (imageDuplicate) {
      trustScore = Math.max(5, trustScore - 30);
      reasons.push(
        "This ticket image has been uploaded before or matches a previously seen image."
      );
    }

    let verdict: "likely_original" | "found_elsewhere" | "known_scam";
    if (trustScore >= 70) {
      verdict = "likely_original";
    } else if (trustScore >= 30) {
      verdict = "found_elsewhere";
    } else {
      verdict = "known_scam";
    }

    return NextResponse.json({
      barcodeResult,
      trustScore,
      verdict,
      reasons,
      imageHash: exactHash,
    });
  } catch (error) {
    console.error("Ticket verification failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Ticket verification failed. Please try again." },
      { status: 500 }
    );
  }
}
