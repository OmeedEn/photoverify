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

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate file type
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Extract QR code and barcode in parallel
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

    // Step 2: Check for duplicate code
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
      // Register the code (increments count or adds new entry)
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

    // Step 3: Also run perceptual hash check for image duplicate detection
    const [exactHash, perceptualHash] = await Promise.all([
      Promise.resolve(generateExactHash(buffer)),
      generatePerceptualHash(buffer),
    ]);

    const exactMatch = await findByExactHash(exactHash);
    const imageId = uuidv4();
    let imageDuplicate = false;

    if (exactMatch) {
      imageDuplicate = true;
    } else {
      // Store the image for future comparisons
      await storeImage({
        id: imageId,
        exactHash,
        perceptualHash,
        uploadedAt: new Date().toISOString(),
        reportedAsScam: false,
        matchCount: 0,
      });

      // Check for similar images via perceptual hash
      const similar = await findSimilarImages(perceptualHash, imageId);
      if (similar.length > 0) {
        imageDuplicate = true;
      }
    }

    // Step 4: Calculate trust score and verdict
    let trustScore = 100;
    const reasons: string[] = [];

    if (barcodeResult.type === "none") {
      // No QR/barcode found -- cannot verify the ticket code
      trustScore = 100;
      reasons.push(
        "No QR code or barcode detected in this image. Upload a clear photo of the ticket code for duplicate checking."
      );
    } else if (barcodeResult.isDuplicate) {
      // Duplicate code found -- high scam risk
      trustScore = 10;
      reasons.push(
        `Duplicate ticket code detected. This code has been checked ${barcodeResult.previousChecks} time(s) before. First seen on ${new Date(barcodeResult.firstSeenAt!).toLocaleDateString()}.`
      );
    } else {
      // First time this code has been seen
      trustScore = 100;
      reasons.push(
        "This ticket code has not been seen before. No duplicates found."
      );
    }

    // Subtract points for image duplicates
    if (imageDuplicate) {
      trustScore = Math.max(5, trustScore - 30);
      reasons.push(
        "This ticket image has been uploaded before or matches a previously seen image."
      );
    }

    // Determine verdict
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
    console.error("Ticket verification error:", error);
    return NextResponse.json(
      { error: "Ticket verification failed. Please try again." },
      { status: 500 }
    );
  }
}
