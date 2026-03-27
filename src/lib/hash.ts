import crypto from "crypto";

/**
 * Generate a perceptual hash (simplified dHash) from image buffer.
 * Compares adjacent pixels to produce a 64-bit hash that is resilient
 * to minor resizing, compression, and color changes.
 */
export async function generatePerceptualHash(
  imageBuffer: Buffer
): Promise<string> {
  // Use sharp to resize to 9x8 grayscale for dHash
  const sharp = (await import("sharp")).default;
  const pixels = await sharp(imageBuffer)
    .resize(9, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer();

  let hash = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = pixels[y * 9 + x];
      const right = pixels[y * 9 + x + 1];
      hash += left < right ? "1" : "0";
    }
  }

  return hash;
}

/**
 * Generate a standard SHA-256 hash for exact duplicate detection.
 */
export function generateExactHash(imageBuffer: Buffer): string {
  return crypto.createHash("sha256").update(imageBuffer).digest("hex");
}

/**
 * Calculate hamming distance between two perceptual hashes.
 * Lower = more similar. 0 = identical. >10 = likely different images.
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/**
 * Determine similarity percentage from hamming distance.
 */
export function similarityFromDistance(distance: number): number {
  const maxDistance = 64; // 8x8 hash
  return Math.max(0, Math.round((1 - distance / maxDistance) * 100));
}
