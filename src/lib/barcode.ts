/**
 * Barcode/QR code extraction and duplicate detection for ticket verification.
 * Uses sharp for image processing and jsQR for QR code detection.
 */

import sharp from "sharp";
import jsQR from "jsqr";
import { createServiceClient } from "@/lib/supabase/service";

export type BarcodeResult = {
  type: "qr" | "barcode" | "none";
  data: string | null;
  isDuplicate: boolean;
  previousChecks: number;
  firstSeenAt: string | null;
};

const codeStore: Map<string, { count: number; firstSeenAt: string }> =
  new Map();

export async function extractQRCode(
  imageBuffer: Buffer
): Promise<string | null> {
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

export async function extractBarcode(
  imageBuffer: Buffer
): Promise<string | null> {
  void imageBuffer;
  return null;
}

export async function checkDuplicateCode(code: string): Promise<{
  isDuplicate: boolean;
  previousChecks: number;
  firstSeenAt: string | null;
}> {
  const supabase = createServiceClient();

  if (!supabase) {
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

  const { data, error } = await supabase
    .from("ticket_codes")
    .select("check_count, first_seen_at")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Ticket code lookup failed:", error);
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

  if (!data) {
    return { isDuplicate: false, previousChecks: 0, firstSeenAt: null };
  }

  const row = data as { check_count: number; first_seen_at: string };

  return {
    isDuplicate: true,
    previousChecks: row.check_count,
    firstSeenAt: row.first_seen_at,
  };
}

export async function registerCode(code: string): Promise<void> {
  const supabase = createServiceClient();

  if (!supabase) {
    const existing = codeStore.get(code);
    if (existing) {
      existing.count += 1;
      return;
    }

    codeStore.set(code, {
      count: 1,
      firstSeenAt: new Date().toISOString(),
    });
    return;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ticket_codes")
    .select("check_count")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Ticket code register lookup failed:", error);
    const existing = codeStore.get(code);
    if (existing) {
      existing.count += 1;
      return;
    }

    codeStore.set(code, {
      count: 1,
      firstSeenAt: now,
    });
    return;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("ticket_codes").insert({
      code,
      check_count: 1,
      first_seen_at: now,
      last_seen_at: now,
    });

    if (insertError) {
      console.error("Ticket code insert failed:", insertError);
    }
    return;
  }

  const row = data as { check_count: number };

  const { error: updateError } = await supabase
    .from("ticket_codes")
    .update({
      check_count: row.check_count + 1,
      last_seen_at: now,
    })
    .eq("code", code);

  if (updateError) {
    console.error("Ticket code update failed:", updateError);
  }
}
