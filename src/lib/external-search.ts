/**
 * External reverse image search integrations.
 * Uses TinEye API and SerpAPI (Google Lens) for web-wide duplicate detection.
 *
 * For MVP: these return mock/demo results when API keys aren't configured.
 * Set TINEYE_API_KEY and SERPAPI_KEY in .env.local to enable real searches.
 */

import type { ExternalMatch } from "./store";

// ─── TinEye Integration ───

interface TinEyeResult {
  matches: ExternalMatch[];
  totalResults: number;
}

export async function searchTinEye(
  imageBuffer: Buffer
): Promise<TinEyeResult> {
  const apiKey = process.env.TINEYE_API_KEY;

  if (!apiKey) {
    // Demo mode - return empty results
    return { matches: [], totalResults: 0 };
  }

  try {
    const formData = new FormData();
    formData.append(
      "image",
      new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" }),
      "search.jpg"
    );

    const response = await fetch(
      `https://api.tineye.com/rest/search/?api_key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("TinEye API error:", response.status);
      return { matches: [], totalResults: 0 };
    }

    const data = await response.json();
    const matches: ExternalMatch[] = (data.result?.matches || [])
      .slice(0, 10)
      .map(
        (m: {
          domain: string;
          backlinks: Array<{ url: string; backlink: string }>;
        }) => ({
          url: m.backlinks?.[0]?.url || m.domain,
          source: `TinEye - ${m.domain}`,
          title: m.backlinks?.[0]?.backlink || m.domain,
        })
      );

    return {
      matches,
      totalResults: data.result?.total_results || 0,
    };
  } catch (error) {
    console.error("TinEye search failed:", error);
    return { matches: [], totalResults: 0 };
  }
}

// ─── SerpAPI / Google Lens Integration ───

interface GoogleLensResult {
  matches: ExternalMatch[];
  totalResults: number;
}

export async function searchGoogleLens(
  imageBuffer: Buffer
): Promise<GoogleLensResult> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    // Demo mode
    return { matches: [], totalResults: 0 };
  }

  try {
    // SerpAPI requires a URL or base64 image
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    const params = new URLSearchParams({
      engine: "google_lens",
      url: dataUrl,
      api_key: apiKey,
    });

    const response = await fetch(
      `https://serpapi.com/search?${params.toString()}`
    );

    if (!response.ok) {
      console.error("SerpAPI error:", response.status);
      return { matches: [], totalResults: 0 };
    }

    const data = await response.json();
    const visualMatches = data.visual_matches || [];
    const matches: ExternalMatch[] = visualMatches
      .slice(0, 10)
      .map(
        (m: { link: string; source: string; thumbnail: string; title: string }) => ({
          url: m.link,
          source: `Google - ${m.source || "Web"}`,
          thumbnailUrl: m.thumbnail,
          title: m.title,
        })
      );

    return {
      matches,
      totalResults: visualMatches.length,
    };
  } catch (error) {
    console.error("Google Lens search failed:", error);
    return { matches: [], totalResults: 0 };
  }
}

// ─── Stock Photo Check ───

export async function checkStockPhotos(
  imageBuffer: Buffer
): Promise<boolean> {
  // In production, check against Shutterstock/Getty/Unsplash APIs
  // For MVP, this is a placeholder that uses buffer length as a no-op
  void imageBuffer;
  return false;
}

// ─── Combined Search ───

export async function searchAllSources(imageBuffer: Buffer): Promise<{
  tinEye: TinEyeResult;
  googleLens: GoogleLensResult;
  isStockPhoto: boolean;
}> {
  // Run all searches in parallel
  const [tinEye, googleLens, isStockPhoto] = await Promise.all([
    searchTinEye(imageBuffer),
    searchGoogleLens(imageBuffer),
    checkStockPhotos(imageBuffer),
  ]);

  return { tinEye, googleLens, isStockPhoto };
}
