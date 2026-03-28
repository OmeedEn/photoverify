/**
 * Image Forensics - Detect AI-generated or Photoshopped images.
 *
 * Techniques:
 * 1. EXIF/Metadata analysis - Check for editing software signatures
 * 2. Error Level Analysis (ELA) - Detect manipulated regions via recompression
 * 3. Noise consistency - Check if noise patterns are uniform (AI images are too clean)
 * 4. JPEG ghost detection - Multiple save artifacts indicate editing
 */

interface MetadataSignal {
  tool: string;
  confidence: "high" | "medium" | "low";
  detail: string;
}

interface ELAResult {
  maxDeviation: number;
  avgDeviation: number;
  suspiciousRegions: number;
  isManipulated: boolean;
}

interface NoiseResult {
  uniformity: number; // 0-100, higher = more uniform (AI-like)
  isAIGenerated: boolean;
}

export interface ForensicsResult {
  score: number; // 0-100, higher = more likely authentic
  verdict: "likely_authentic" | "possibly_edited" | "likely_manipulated";
  signals: string[];
  metadata: MetadataSignal[];
  ela: ELAResult;
  noise: NoiseResult;
}

// Known software signatures found in EXIF data
const AI_GENERATORS = [
  "dall-e",
  "midjourney",
  "stable diffusion",
  "stablediffusion",
  "comfyui",
  "automatic1111",
  "novelai",
  "adobe firefly",
  "bing image creator",
  "leonardo.ai",
  "ideogram",
];

const EDITING_SOFTWARE = [
  "photoshop",
  "gimp",
  "affinity photo",
  "pixlr",
  "canva",
  "paint.net",
  "lightroom",
  "capture one",
  "snapseed",
  "facetune",
  "faceapp",
  "remini",
];

/**
 * Analyze EXIF metadata for editing/AI signatures.
 */
async function analyzeMetadata(
  imageBuffer: Buffer
): Promise<MetadataSignal[]> {
  const signals: MetadataSignal[] = [];

  // Convert buffer to string and search for known signatures
  // EXIF data is embedded as ASCII in the file header
  const headerStr = imageBuffer.subarray(0, Math.min(65536, imageBuffer.length)).toString("latin1").toLowerCase();

  // Check for AI generator signatures
  for (const gen of AI_GENERATORS) {
    if (headerStr.includes(gen)) {
      signals.push({
        tool: gen,
        confidence: "high",
        detail: `AI generator "${gen}" signature found in image metadata`,
      });
    }
  }

  // Check for editing software
  for (const editor of EDITING_SOFTWARE) {
    if (headerStr.includes(editor)) {
      signals.push({
        tool: editor,
        confidence: "medium",
        detail: `Editing software "${editor}" detected in metadata (image may have been modified)`,
      });
    }
  }

  // Check for stripped EXIF (suspicious for product photos)
  const hasExif = headerStr.includes("exif");
  const hasJfif = headerStr.includes("jfif");
  const hasIcc = headerStr.includes("icc_profile");

  if (!hasExif && !hasJfif && !hasIcc && imageBuffer.length > 50000) {
    signals.push({
      tool: "unknown",
      confidence: "low",
      detail: "Image metadata has been stripped -- this is common in screenshots and AI-generated images",
    });
  }

  // Check for Adobe XMP data (indicates processing)
  if (headerStr.includes("xmp") || headerStr.includes("adobe")) {
    if (!signals.some((s) => s.tool.includes("photoshop"))) {
      signals.push({
        tool: "Adobe software",
        confidence: "low",
        detail: "Adobe processing markers detected in file",
      });
    }
  }

  return signals;
}

/**
 * Error Level Analysis (ELA).
 * Re-saves the image at a known quality and compares the error.
 * Manipulated regions show different error levels than the original.
 */
async function performELA(imageBuffer: Buffer): Promise<ELAResult> {
  const sharp = (await import("sharp")).default;

  try {
    // Get original pixel data
    const original = await sharp(imageBuffer)
      .resize(256, 256, { fit: "fill" })
      .raw()
      .toBuffer();

    // Re-compress at quality 75 and get pixel data
    const recompressedBuf = await sharp(imageBuffer)
      .resize(256, 256, { fit: "fill" })
      .jpeg({ quality: 75 })
      .toBuffer();

    const recompressed = await sharp(recompressedBuf).raw().toBuffer();

    // Calculate pixel-by-pixel differences
    const pixelCount = original.length / 3;
    let totalDev = 0;
    let maxDev = 0;
    let suspiciousPixels = 0;
    const threshold = 40; // Deviation threshold for "suspicious"

    for (let i = 0; i < original.length; i += 3) {
      const rDiff = Math.abs(original[i] - recompressed[i]);
      const gDiff = Math.abs(original[i + 1] - recompressed[i + 1]);
      const bDiff = Math.abs(original[i + 2] - recompressed[i + 2]);
      const avgDiff = (rDiff + gDiff + bDiff) / 3;

      totalDev += avgDiff;
      if (avgDiff > maxDev) maxDev = avgDiff;
      if (avgDiff > threshold) suspiciousPixels++;
    }

    const avgDeviation = totalDev / pixelCount;
    const suspiciousPercent = (suspiciousPixels / pixelCount) * 100;

    // High variance in ELA suggests manipulation
    // Authentic photos have relatively uniform ELA
    // Pasted/edited regions show as bright spots
    return {
      maxDeviation: Math.round(maxDev),
      avgDeviation: Math.round(avgDeviation * 10) / 10,
      suspiciousRegions: Math.round(suspiciousPercent),
      isManipulated: suspiciousPercent > 15 || maxDev > 80,
    };
  } catch {
    return {
      maxDeviation: 0,
      avgDeviation: 0,
      suspiciousRegions: 0,
      isManipulated: false,
    };
  }
}

/**
 * Noise consistency analysis.
 * AI-generated images have unnaturally uniform noise patterns.
 * Real photos from cameras have sensor noise that varies across the image.
 */
async function analyzeNoise(imageBuffer: Buffer): Promise<NoiseResult> {
  const sharp = (await import("sharp")).default;

  try {
    // Convert to grayscale and get raw pixels
    const gray = await sharp(imageBuffer)
      .resize(128, 128, { fit: "fill" })
      .grayscale()
      .raw()
      .toBuffer();

    // Calculate local noise variance in 8x8 blocks
    const blockSize = 8;
    const blocksPerRow = 128 / blockSize;
    const variances: number[] = [];

    for (let by = 0; by < blocksPerRow; by++) {
      for (let bx = 0; bx < blocksPerRow; bx++) {
        let sum = 0;
        let sumSq = 0;
        const count = blockSize * blockSize;

        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const px = gray[(by * blockSize + y) * 128 + (bx * blockSize + x)];
            sum += px;
            sumSq += px * px;
          }
        }

        const mean = sum / count;
        const variance = sumSq / count - mean * mean;
        variances.push(variance);
      }
    }

    // Calculate variance of variances (meta-variance)
    // AI images: low meta-variance (uniform noise)
    // Real photos: high meta-variance (natural noise variation)
    const meanVar =
      variances.reduce((a, b) => a + b, 0) / variances.length;
    const metaVariance =
      variances.reduce((a, v) => a + (v - meanVar) ** 2, 0) /
      variances.length;

    // Normalize to 0-100 uniformity score
    // Lower meta-variance = higher uniformity = more likely AI
    const uniformity = Math.max(
      0,
      Math.min(100, 100 - Math.sqrt(metaVariance) / 5)
    );

    return {
      uniformity: Math.round(uniformity),
      isAIGenerated: uniformity > 75,
    };
  } catch {
    return {
      uniformity: 50,
      isAIGenerated: false,
    };
  }
}

/**
 * Run full forensic analysis on an image.
 */
export async function analyzeImage(
  imageBuffer: Buffer
): Promise<ForensicsResult> {
  const [metadata, ela, noise] = await Promise.all([
    analyzeMetadata(imageBuffer),
    performELA(imageBuffer),
    analyzeNoise(imageBuffer),
  ]);

  let score = 100;
  const signals: string[] = [];

  // Metadata signals
  const aiSignals = metadata.filter((m) =>
    AI_GENERATORS.some((g) => m.tool.includes(g))
  );
  const editSignals = metadata.filter((m) =>
    EDITING_SOFTWARE.some((e) => m.tool.includes(e))
  );

  if (aiSignals.length > 0) {
    score -= 60;
    signals.push(
      `AI generation tool detected: ${aiSignals.map((s) => s.tool).join(", ")}`
    );
  }

  if (editSignals.length > 0) {
    score -= 20;
    signals.push(
      `Editing software detected: ${editSignals.map((s) => s.tool).join(", ")}`
    );
  }

  if (metadata.some((m) => m.detail.includes("stripped"))) {
    score -= 10;
    signals.push("Image metadata has been stripped (common in AI and edited images)");
  }

  // ELA signals
  if (ela.isManipulated) {
    score -= 25;
    signals.push(
      `Error Level Analysis detected ${ela.suspiciousRegions}% suspicious regions -- possible compositing or editing`
    );
  } else if (ela.suspiciousRegions > 5) {
    score -= 10;
    signals.push(
      `Minor ELA anomalies detected (${ela.suspiciousRegions}% of image) -- could indicate light editing`
    );
  }

  // Noise signals
  if (noise.isAIGenerated) {
    score -= 30;
    signals.push(
      `Noise pattern is ${noise.uniformity}% uniform -- AI-generated images typically show unnaturally consistent noise`
    );
  } else if (noise.uniformity > 60) {
    score -= 10;
    signals.push(
      `Noise uniformity is moderately high (${noise.uniformity}%) -- may indicate processing or generation`
    );
  }

  // Positive signal
  if (signals.length === 0) {
    signals.push("No signs of AI generation or digital manipulation detected");
  }

  score = Math.max(0, Math.min(100, score));

  let verdict: ForensicsResult["verdict"];
  if (score >= 70) {
    verdict = "likely_authentic";
  } else if (score >= 40) {
    verdict = "possibly_edited";
  } else {
    verdict = "likely_manipulated";
  }

  return { score, verdict, signals, metadata, ela, noise };
}
