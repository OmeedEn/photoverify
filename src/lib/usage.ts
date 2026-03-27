import { createClient } from "@/lib/supabase/client";

export const FREE_SCAN_LIMIT = 5;

/**
 * Get the number of scans the user has performed this calendar month.
 */
export async function getMonthlyScansCount(userId: string): Promise<number> {
  const supabase = createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  if (error) {
    console.error("Error fetching scan count:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Check if the user has an active subscription.
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, status, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .limit(1)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Record a new scan in the database.
 */
export async function recordScan(params: {
  userId: string;
  imageHash: string;
  trustScore: number;
  verdict: string;
}): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("scans").insert({
    user_id: params.userId,
    image_hash: params.imageHash,
    trust_score: params.trustScore,
    verdict: params.verdict,
  });

  if (error) {
    console.error("Error recording scan:", error);
  }
}

/**
 * Check if a user can perform a scan.
 * Returns { allowed, remaining, isPro }.
 */
export async function canUserScan(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  isPro: boolean;
  used: number;
}> {
  const isPro = await hasActiveSubscription(userId);

  if (isPro) {
    return { allowed: true, remaining: Infinity, isPro: true, used: 0 };
  }

  const used = await getMonthlyScansCount(userId);
  const remaining = Math.max(0, FREE_SCAN_LIMIT - used);

  return {
    allowed: remaining > 0,
    remaining,
    isPro: false,
    used,
  };
}

/**
 * Get user's scan history from the scans table.
 */
export async function getUserScans(
  userId: string,
  limit = 20
): Promise<
  Array<{
    id: string;
    image_hash: string;
    trust_score: number;
    verdict: string;
    created_at: string;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("scans")
    .select("id, image_hash, trust_score, verdict, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user scans:", error);
    return [];
  }

  return data ?? [];
}
