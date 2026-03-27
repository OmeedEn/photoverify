/**
 * Trust Score Engine
 *
 * Calculates a 0-100 trust score based on multiple verification signals.
 * Higher = more trustworthy (likely original photo).
 * Lower = more suspicious (likely duplicated/stolen).
 */

import type { InternalMatch, ExternalMatch } from "./store";

interface ScoringInput {
  internalMatches: InternalMatch[];
  externalMatchCount: number;
  externalMatches: ExternalMatch[];
  isStockPhoto: boolean;
  isReportedScam: boolean;
}

interface ScoringResult {
  score: number;
  verdict: "likely_original" | "found_elsewhere" | "known_scam";
  reasons: string[];
}

export function calculateTrustScore(input: ScoringInput): ScoringResult {
  let score = 100;
  const reasons: string[] = [];

  // Known scam image - immediate red flag
  if (input.isReportedScam) {
    score -= 70;
    reasons.push("This image has been reported as a scam by the community");
  }

  // Stock photo detection
  if (input.isStockPhoto) {
    score -= 50;
    reasons.push("This appears to be a stock photo, not an original image");
  }

  // Internal duplicates (same image uploaded by different sources)
  if (input.internalMatches.length > 0) {
    const scamMatches = input.internalMatches.filter((m) => m.reportedAsScam);
    const normalMatches = input.internalMatches.filter(
      (m) => !m.reportedAsScam
    );

    if (scamMatches.length > 0) {
      score -= 40;
      reasons.push(
        `Matches ${scamMatches.length} image(s) previously reported as scam`
      );
    }

    if (normalMatches.length > 0) {
      score -= Math.min(20, normalMatches.length * 5);
      reasons.push(
        `Found ${normalMatches.length} similar image(s) in our database`
      );
    }
  }

  // External matches (found on other websites)
  if (input.externalMatchCount > 0) {
    const penalty = Math.min(40, input.externalMatchCount * 8);
    score -= penalty;

    if (input.externalMatchCount === 1) {
      reasons.push("This image was found on 1 other website");
    } else {
      reasons.push(
        `This image was found on ${input.externalMatchCount} other websites`
      );
    }

    // Check for marketplace/social media sources specifically
    const marketplaceSources = input.externalMatches.filter(
      (m) =>
        /ebay|amazon|craigslist|facebook|marketplace|offerup|mercari|letgo/i.test(
          m.source + m.url
        )
    );

    if (marketplaceSources.length > 0) {
      score -= 15;
      reasons.push(
        "Image appears on other marketplace listings - higher risk of reuse"
      );
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine verdict
  let verdict: ScoringResult["verdict"];
  if (score >= 70) {
    verdict = "likely_original";
  } else if (score >= 30) {
    verdict = "found_elsewhere";
  } else {
    verdict = "known_scam";
  }

  // Add positive reason if clean
  if (reasons.length === 0) {
    reasons.push("No duplicates found across our database or the web");
  }

  return { score, verdict, reasons };
}
