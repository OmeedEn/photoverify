import { createServiceClient } from "@/lib/supabase/service";

/**
 * Durable image fingerprint store for production, with in-memory fallback
 * when Supabase service credentials are unavailable.
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

interface ImageFingerprintRow {
  id: string;
  exact_hash: string;
  perceptual_hash: string;
  uploaded_at: string;
  source: string | null;
  reported_as_scam: boolean;
  match_count: number;
}

const imageStore: Map<string, StoredImage> = new Map();
const resultStore: Map<string, VerificationResult> = new Map();

function mapRow(row: ImageFingerprintRow): StoredImage {
  return {
    id: row.id,
    exactHash: row.exact_hash,
    perceptualHash: row.perceptual_hash,
    uploadedAt: row.uploaded_at,
    source: row.source ?? undefined,
    reportedAsScam: row.reported_as_scam,
    matchCount: row.match_count,
  };
}

function storeImageInMemory(image: StoredImage): StoredImage {
  imageStore.set(image.id, image);
  return image;
}

function getAllImagesInMemory(): StoredImage[] {
  return Array.from(imageStore.values());
}

export async function storeImage(image: StoredImage): Promise<StoredImage> {
  const supabase = createServiceClient();

  if (!supabase) {
    return storeImageInMemory(image);
  }

  const { data, error } = await supabase
    .from("image_fingerprints")
    .insert({
      id: image.id,
      exact_hash: image.exactHash,
      perceptual_hash: image.perceptualHash,
      uploaded_at: image.uploadedAt,
      source: image.source ?? null,
      reported_as_scam: image.reportedAsScam,
      match_count: image.matchCount,
    })
    .select(
      "id, exact_hash, perceptual_hash, uploaded_at, source, reported_as_scam, match_count"
    )
    .single();

  if (error) {
    console.error("Image fingerprint insert failed:", error);
    return storeImageInMemory(image);
  }

  return mapRow(data as ImageFingerprintRow);
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  const supabase = createServiceClient();

  if (!supabase) {
    return imageStore.get(id);
  }

  const { data, error } = await supabase
    .from("image_fingerprints")
    .select(
      "id, exact_hash, perceptual_hash, uploaded_at, source, reported_as_scam, match_count"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Image fingerprint lookup failed:", error);
    return imageStore.get(id);
  }

  return data ? mapRow(data as ImageFingerprintRow) : undefined;
}

export async function findByExactHash(
  hash: string
): Promise<StoredImage | undefined> {
  const supabase = createServiceClient();

  if (!supabase) {
    return getAllImagesInMemory().find((img) => img.exactHash === hash);
  }

  const { data, error } = await supabase
    .from("image_fingerprints")
    .select(
      "id, exact_hash, perceptual_hash, uploaded_at, source, reported_as_scam, match_count"
    )
    .eq("exact_hash", hash)
    .order("uploaded_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("Exact hash lookup failed:", error);
    return getAllImagesInMemory().find((img) => img.exactHash === hash);
  }

  const rows = (data ?? []) as ImageFingerprintRow[];
  return rows[0] ? mapRow(rows[0]) : undefined;
}

export async function findSimilarImages(
  perceptualHash: string,
  excludeId?: string
): Promise<StoredImage[]> {
  const supabase = createServiceClient();

  if (!supabase) {
    return getAllImagesInMemory().filter(
      (img) =>
        img.perceptualHash === perceptualHash &&
        (!excludeId || img.id !== excludeId)
    );
  }

  let query = supabase
    .from("image_fingerprints")
    .select(
      "id, exact_hash, perceptual_hash, uploaded_at, source, reported_as_scam, match_count"
    )
    .eq("perceptual_hash", perceptualHash);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.order("uploaded_at", {
    ascending: false,
  });

  if (error) {
    console.error("Perceptual hash lookup failed:", error);
    return getAllImagesInMemory().filter(
      (img) =>
        img.perceptualHash === perceptualHash &&
        (!excludeId || img.id !== excludeId)
    );
  }

  return ((data ?? []) as ImageFingerprintRow[]).map(mapRow);
}

export async function getAllImages(): Promise<StoredImage[]> {
  const supabase = createServiceClient();

  if (!supabase) {
    return getAllImagesInMemory();
  }

  const { data, error } = await supabase
    .from("image_fingerprints")
    .select(
      "id, exact_hash, perceptual_hash, uploaded_at, source, reported_as_scam, match_count"
    )
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Image fingerprint list failed:", error);
    return getAllImagesInMemory();
  }

  return ((data ?? []) as ImageFingerprintRow[]).map(mapRow);
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

export async function reportAsScam(imageId: string): Promise<boolean> {
  const supabase = createServiceClient();

  if (!supabase) {
    const image = imageStore.get(imageId);
    if (!image) {
      return false;
    }

    image.reportedAsScam = true;
    image.matchCount += 1;
    return true;
  }

  const { data, error } = await supabase
    .from("image_fingerprints")
    .select("match_count")
    .eq("id", imageId)
    .maybeSingle();

  if (error) {
    console.error("Image fingerprint report lookup failed:", error);
    const image = imageStore.get(imageId);
    if (!image) {
      return false;
    }

    image.reportedAsScam = true;
    image.matchCount += 1;
    return true;
  }

  if (!data) {
    return false;
  }

  const row = data as { match_count: number };

  const { error: updateError } = await supabase
    .from("image_fingerprints")
    .update({
      reported_as_scam: true,
      match_count: (row.match_count ?? 0) + 1,
    })
    .eq("id", imageId);

  if (updateError) {
    console.error("Image fingerprint report update failed:", updateError);
    return false;
  }

  return true;
}

export async function getScamImages(): Promise<StoredImage[]> {
  const supabase = createServiceClient();

  if (!supabase) {
    return getAllImagesInMemory().filter((img) => img.reportedAsScam);
  }

  const { data, error } = await supabase
    .from("image_fingerprints")
    .select(
      "id, exact_hash, perceptual_hash, uploaded_at, source, reported_as_scam, match_count"
    )
    .eq("reported_as_scam", true)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Scam fingerprint lookup failed:", error);
    return getAllImagesInMemory().filter((img) => img.reportedAsScam);
  }

  return ((data ?? []) as ImageFingerprintRow[]).map(mapRow);
}

export async function getStats() {
  const images = await getAllImages();
  const results = Array.from(resultStore.values());

  return {
    totalChecks: results.length,
    totalImages: images.length,
    scamsDetected: results.filter((result) => result.trustScore < 30).length,
    scamReports: images.filter((image) => image.reportedAsScam).length,
    avgTrustScore:
      results.length > 0
        ? Math.round(
            results.reduce((sum, result) => sum + result.trustScore, 0) /
              results.length
          )
        : 0,
  };
}
