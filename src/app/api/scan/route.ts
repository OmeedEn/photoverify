import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generatePerceptualHash, generateExactHash } from "@/lib/hash";
import {
  storeImage,
  findByExactHash,
  findSimilarImages,
  storeResult,
  getScamImages,
} from "@/lib/store";
import { searchAllSources } from "@/lib/external-search";
import { calculateTrustScore } from "@/lib/scorer";
import { analyzeImage } from "@/lib/image-forensics";
import { extractQRCode, checkDuplicateCode, registerCode } from "@/lib/barcode";
import type { InternalMatch, VerificationResult } from "@/lib/store";
import type { BarcodeResult } from "@/lib/barcode";
import { createClient } from "@/lib/supabase/server";
import { canUserScan, recordScan } from "@/lib/usage";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 20, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before scanning again." },
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

    // Check authenticated user's usage quota
    let currentUserId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      currentUserId = user?.id ?? null;

      if (currentUserId) {
        const usage = await canUserScan(currentUserId);
        if (!usage.allowed) {
          return NextResponse.json(
            {
              error:
                "You have reached the free verification limit for this month. Upgrade to continue.",
            },
            { status: 403 }
          );
        }
      }
    } catch (authError) {
      console.error("Usage check failed:", authError);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Run ALL checks in parallel
    const [exactHash, perceptualHash, forensics, qrData] = await Promise.all([
      generateExactHash(buffer),
      generatePerceptualHash(buffer),
      analyzeImage(buffer),
      extractQRCode(buffer).catch(() => null),
    ]);

    // --- Duplicate Detection ---
    const exactMatch = await findByExactHash(exactHash);
    let verification: VerificationResult & { verdict: string; reasons: string[] };

    if (exactMatch) {
      const verdict = exactMatch.reportedAsScam ? "known_scam" : "found_elsewhere";
      const reasons = exactMatch.reportedAsScam
        ? ["This image exactly matches one previously reported as a scam."]
        : ["This image exactly matches one previously seen in VerifyDeal."];
      verification = {
        id: uuidv4(),
        imageId: exactMatch.id,
        trustScore: exactMatch.reportedAsScam ? 5 : 50,
        internalMatches: [
          {
            imageId: exactMatch.id,
            similarity: 100,
            uploadedAt: exactMatch.uploadedAt,
            source: exactMatch.source,
            reportedAsScam: exactMatch.reportedAsScam,
          },
        ],
        externalMatches: [],
        stockPhotoMatch: false,
        scamDatabaseMatch: exactMatch.reportedAsScam,
        checkedAt: new Date().toISOString(),
        verdict,
        reasons,
      };
      storeResult(verification);

      if (currentUserId) {
        await recordScan({
          userId: currentUserId,
          imageHash: exactHash,
          trustScore: verification.trustScore,
          verdict,
        }).catch((err) => console.error("Failed to record scan:", err));
      }
    } else {
      const imageId = uuidv4();
      await storeImage({
        id: imageId,
        exactHash,
        perceptualHash,
        uploadedAt: new Date().toISOString(),
        reportedAsScam: false,
        matchCount: 0,
      });

      const similarImages = await findSimilarImages(perceptualHash, imageId);
      const internalMatches: InternalMatch[] = similarImages.map((img) => ({
        imageId: img.id,
        similarity: 95,
        uploadedAt: img.uploadedAt,
        source: img.source,
        reportedAsScam: img.reportedAsScam,
      }));

      const scamImages = await getScamImages();
      const isReportedScam = scamImages.some(
        (img) => img.perceptualHash === perceptualHash
      );

      const externalResults = await searchAllSources(buffer);
      const allExternalMatches = [
        ...externalResults.tinEye.matches,
        ...externalResults.googleLens.matches,
      ];

      const scoring = calculateTrustScore({
        internalMatches,
        externalMatchCount:
          externalResults.tinEye.totalResults +
          externalResults.googleLens.totalResults,
        externalMatches: allExternalMatches,
        isStockPhoto: externalResults.isStockPhoto,
        isReportedScam,
        forensics,
      });

      verification = {
        id: uuidv4(),
        imageId,
        trustScore: scoring.score,
        internalMatches,
        externalMatches: allExternalMatches,
        stockPhotoMatch: externalResults.isStockPhoto,
        scamDatabaseMatch: isReportedScam,
        checkedAt: new Date().toISOString(),
        verdict: scoring.verdict,
        reasons: scoring.reasons,
      };
      storeResult(verification);

      if (currentUserId) {
        await recordScan({
          userId: currentUserId,
          imageHash: exactHash,
          trustScore: verification.trustScore,
          verdict: scoring.verdict,
        }).catch((err) => console.error("Failed to record scan:", err));
      }
    }

    // --- Barcode/QR Check ---
    let barcodeResult: BarcodeResult = {
      type: "none",
      data: null,
      isDuplicate: false,
      previousChecks: 0,
      firstSeenAt: null,
    };

    if (qrData) {
      const dupCheck = await checkDuplicateCode(qrData);
      await registerCode(qrData);
      barcodeResult = {
        type: "qr",
        data: qrData,
        isDuplicate: dupCheck.isDuplicate,
        previousChecks: dupCheck.previousChecks,
        firstSeenAt: dupCheck.firstSeenAt,
      };
    }

    return NextResponse.json({
      verification,
      forensics,
      barcode: barcodeResult,
    });
  } catch (error) {
    console.error("Scan failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Scan failed. Please try again." },
      { status: 500 }
    );
  }
}
