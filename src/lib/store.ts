/**
 * In-memory store for MVP. Replace with Supabase/Postgres for production.
 * Stores image hashes, verification results, and reported scam images.
 */

export interface StoredImage {
  id: string;
  exactHash: string;
  perceptualHash: string;
  uploadedAt: string;
  source?: string;
  reportedAsScam: boolean;
  matchCount: number;
}

export interface VerificationResult {
  id: string;
  imageId: string;
  trustScore: number;
  internalMatches: InternalMatch[];
  externalMatches: ExternalMatch[];
  stockPhotoMatch: boolean;
  scamDatabaseMatch: boolean;
  checkedAt: string;
}

export interface InternalMatch {
  imageId: string;
  similarity: number;
  uploadedAt: string;
  source?: string;
  reportedAsScam: boolean;
}

export interface ExternalMatch {
  url: string;
  source: string;
  thumbnailUrl?: string;
  title?: string;
}

// In-memory storage (replace with DB in production)
const imageStore: Map<string, StoredImage> = new Map();
const resultStore: Map<string, VerificationResult> = new Map();
const hashIndex: Map<string, string[]> = new Map(); // perceptualHash -> imageIds

export function storeImage(image: StoredImage): void {
  imageStore.set(image.id, image);

  // Index by perceptual hash
  const existing = hashIndex.get(image.perceptualHash) || [];
  existing.push(image.id);
  hashIndex.set(image.perceptualHash, existing);
}

export function getImage(id: string): StoredImage | undefined {
  return imageStore.get(id);
}

export function findByExactHash(hash: string): StoredImage | undefined {
  for (const img of imageStore.values()) {
    if (img.exactHash === hash) return img;
  }
  return undefined;
}

export function findSimilarImages(
  perceptualHash: string,
  excludeId?: string
): StoredImage[] {
  const results: StoredImage[] = [];
  for (const img of imageStore.values()) {
    if (img.id === excludeId) continue;
    // Simple check: exact perceptual hash match
    if (img.perceptualHash === perceptualHash) {
      results.push(img);
    }
  }
  return results;
}

export function getAllImages(): StoredImage[] {
  return Array.from(imageStore.values());
}

export function storeResult(result: VerificationResult): void {
  resultStore.set(result.id, result);
}

export function getResult(id: string): VerificationResult | undefined {
  return resultStore.get(id);
}

export function getRecentResults(limit: number = 20): VerificationResult[] {
  return Array.from(resultStore.values())
    .sort(
      (a, b) =>
        new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    )
    .slice(0, limit);
}

export function reportAsScam(imageId: string): boolean {
  const img = imageStore.get(imageId);
  if (!img) return false;
  img.reportedAsScam = true;
  img.matchCount += 1;
  return true;
}

export function getScamImages(): StoredImage[] {
  return Array.from(imageStore.values()).filter((img) => img.reportedAsScam);
}

export function getStats() {
  const images = Array.from(imageStore.values());
  const results = Array.from(resultStore.values());
  return {
    totalChecks: results.length,
    totalImages: images.length,
    scamsDetected: results.filter((r) => r.trustScore < 30).length,
    scamReports: images.filter((i) => i.reportedAsScam).length,
    avgTrustScore:
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.trustScore, 0) / results.length
          )
        : 0,
  };
}
