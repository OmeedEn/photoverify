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
import type { InternalMatch, VerificationResult } from "@/lib/store";

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

    // Step 1: Generate hashes
    const [exactHash, perceptualHash] = await Promise.all([
      Promise.resolve(generateExactHash(buffer)),
      generatePerceptualHash(buffer),
    ]);

    // Step 2: Check for exact duplicate in our DB
    const exactMatch = findByExactHash(exactHash);
    if (exactMatch) {
      const result: VerificationResult = {
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
      };
      storeResult(result);
      return NextResponse.json(result);
    }

    // Step 3: Store the new image
    const imageId = uuidv4();
    storeImage({
      id: imageId,
      exactHash,
      perceptualHash,
      uploadedAt: new Date().toISOString(),
      reportedAsScam: false,
      matchCount: 0,
    });

    // Step 4: Find similar images internally (perceptual hash)
    const similarImages = findSimilarImages(perceptualHash, imageId);
    const internalMatches: InternalMatch[] = similarImages.map((img) => ({
      imageId: img.id,
      similarity: 95,
      uploadedAt: img.uploadedAt,
      source: img.source,
      reportedAsScam: img.reportedAsScam,
    }));

    // Step 5: Check against known scam database
    const scamImages = getScamImages();
    const isReportedScam = scamImages.some(
      (img) => img.perceptualHash === perceptualHash
    );

    // Step 6: Search external sources (TinEye, Google Lens)
    const externalResults = await searchAllSources(buffer);
    const allExternalMatches = [
      ...externalResults.tinEye.matches,
      ...externalResults.googleLens.matches,
    ];

    // Step 7: Calculate trust score
    const scoring = calculateTrustScore({
      internalMatches,
      externalMatchCount:
        externalResults.tinEye.totalResults +
        externalResults.googleLens.totalResults,
      externalMatches: allExternalMatches,
      isStockPhoto: externalResults.isStockPhoto,
      isReportedScam,
    });

    // Step 8: Store and return result
    const result: VerificationResult = {
      id: uuidv4(),
      imageId,
      trustScore: scoring.score,
      internalMatches,
      externalMatches: allExternalMatches,
      stockPhotoMatch: externalResults.isStockPhoto,
      scamDatabaseMatch: isReportedScam,
      checkedAt: new Date().toISOString(),
    };
    storeResult(result);

    return NextResponse.json({
      ...result,
      verdict: scoring.verdict,
      reasons: scoring.reasons,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
