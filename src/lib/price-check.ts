export interface PriceRange {
  min: number;
  max: number;
  avg: number;
}

export interface PriceResult {
  verdict: "fair" | "suspicious" | "likely_scam";
  score: number;
  reason: string;
  marketRange: PriceRange;
  percentBelowAvg: number;
}

export const CATEGORIES: Record<string, PriceRange> = {
  "Concert tickets": { min: 50, max: 500, avg: 150 },
  "NFL/NBA/MLB tickets": { min: 40, max: 800, avg: 200 },
  "iPhone (recent)": { min: 400, max: 1200, avg: 700 },
  "MacBook": { min: 500, max: 2500, avg: 1200 },
  "PlayStation 5": { min: 300, max: 550, avg: 450 },
  "Xbox Series X": { min: 300, max: 550, avg: 400 },
  "Nintendo Switch": { min: 150, max: 350, avg: 250 },
  "AirPods Pro": { min: 120, max: 250, avg: 180 },
  "Designer handbag": { min: 200, max: 5000, avg: 800 },
  "Sneakers (limited)": { min: 150, max: 2000, avg: 400 },
  "GPU (graphics card)": { min: 200, max: 2000, avg: 500 },
  "Generic electronics": { min: 50, max: 1000, avg: 200 },
  "Generic tickets": { min: 30, max: 500, avg: 120 },
  "Generic item": { min: 20, max: 500, avg: 100 },
};

export function analyzePrice(
  category: string,
  askingPrice: number
): PriceResult {
  const range = CATEGORIES[category] || CATEGORIES["Generic item"];
  const percentOfAvg = (askingPrice / range.avg) * 100;
  const percentBelowAvg = Math.max(0, Math.round(100 - percentOfAvg));

  if (percentOfAvg < 40) {
    return {
      verdict: "likely_scam",
      score: Math.max(0, Math.round(percentOfAvg / 2)),
      reason: `This price is ${percentBelowAvg}% below the average market value of $${range.avg}. Prices this low are almost always scams.`,
      marketRange: range,
      percentBelowAvg,
    };
  }

  if (percentOfAvg < 65) {
    return {
      verdict: "suspicious",
      score: Math.round(20 + percentOfAvg / 2),
      reason: `This price is ${percentBelowAvg}% below the average market value of $${range.avg}. Exercise caution and verify the seller.`,
      marketRange: range,
      percentBelowAvg,
    };
  }

  return {
    verdict: "fair",
    score: Math.min(100, Math.round(50 + percentOfAvg / 2)),
    reason:
      percentBelowAvg > 0
        ? `This price is ${percentBelowAvg}% below the average market value of $${range.avg}. This appears to be within a reasonable range.`
        : `This price is at or above the average market value of $${range.avg}. Pricing looks normal.`,
    marketRange: range,
    percentBelowAvg,
  };
}
