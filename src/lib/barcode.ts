/**
 * Barcode/QR code extraction and duplicate detection for ticket verification.
 * Uses sharp for image processing and jsQR for QR code detection.
 */

import sharp from "sharp";
import jsQR from "jsqr";

export type BarcodeResult = {
  type: "qr" | "barcode" | "none";
  data: string | null;
  isDuplicate: boolean;
  previousChecks: number;
  firstSeenAt: string | null;
};

// In-memory store for seen codes: code -> { count, firstSeenAt }
const codeStore: Map<string, { count: number; firstSeenAt: string }> = new Map();

/**
 * Extract a QR code from an image buffer using sharp + jsQR.
 * Returns the decoded string data or null if no QR code found.
 */
export async function extractQRCode(
  imageBuffer: Buffer
): Promise<string | null> {
  // Get raw RGBA pixel data from the image
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const clampedData = new Uint8ClampedArray(
    data.buffer,
    data.byteOffset,
    data.byteLength
  );

  const result = jsQR(clampedData, info.width, info.height, {
    inversionAttempts: "attemptBoth",
  });

  return result?.data ?? null;
}

/**
 * Extract a barcode from an image buffer.
 * Placeholder for MVP -- returns null. A future version could use
 * a barcode library (e.g. zbar-wasm, zxing) for 1D barcode detection.
 */
export async function extractBarcode(
  imageBuffer: Buffer
): Promise<string | null> {
  // Placeholder: horizontal line analysis for barcode-like patterns
  // For MVP, we return null and rely on QR detection.
  void imageBuffer;
  return null;
}

/**
 * Check if a code has been seen before.
 */
export function checkDuplicateCode(code: string): {
  isDuplicate: boolean;
  previousChecks: number;
  firstSeenAt: string | null;
} {
  const entry = codeStore.get(code);
  if (!entry) {
    return { isDuplicate: false, previousChecks: 0, firstSeenAt: null };
  }
  return {
    isDuplicate: true,
    previousChecks: entry.count,
    firstSeenAt: entry.firstSeenAt,
  };
}

/**
 * Register a code in the store with a timestamp.
 * If the code already exists, increment its check count.
 */
export function registerCode(code: string): void {
  const existing = codeStore.get(code);
  if (existing) {
    existing.count += 1;
  } else {
    codeStore.set(code, {
      count: 1,
      firstSeenAt: new Date().toISOString(),
    });
  }
}
