import { createClient } from "@/lib/supabase/server";
import { getCommunityReportCount } from "@/lib/scam-feed";

export const FREE_SCAN_LIMIT = 5;

export interface UserScan {
  id: string;
  image_hash: string;
  trust_score: number;
  verdict: string;
  created_at: string;
}

export async function getMonthlyScansCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

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

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient();

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

export async function recordScan(params: {
  userId: string;
  imageHash: string;
  trustScore: number;
  verdict: string;
}): Promise<void> {
  const supabase = await createClient();

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

export async function getUserScans(
  userId: string,
  limit = 20
): Promise<UserScan[]> {
  const supabase = await createClient();

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

export async function getDashboardData(userId: string): Promise<{
  results: Array<{
    id: string;
    imageHash: string;
    trustScore: number;
    verdict: string;
    checkedAt: string;
  }>;
  stats: {
    totalChecks: number;
    scamsDetected: number;
    scamReports: number;
    avgTrustScore: number;
  };
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scans")
    .select("id, image_hash, trust_score, verdict, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dashboard scans:", error);
    return {
      results: [],
      stats: {
        totalChecks: 0,
        scamsDetected: 0,
        scamReports: await getCommunityReportCount(),
        avgTrustScore: 0,
      },
    };
  }

  const scans = data ?? [];
  const communityReports = await getCommunityReportCount();
  const totalChecks = scans.length;
  const scamsDetected = scans.filter((scan) => scan.trust_score < 30).length;
  const avgTrustScore =
    scans.length > 0
      ? Math.round(
          scans.reduce((sum, scan) => sum + scan.trust_score, 0) / scans.length
        )
      : 0;

  return {
    results: scans.slice(0, 20).map((scan) => ({
      id: scan.id,
      imageHash: scan.image_hash,
      trustScore: scan.trust_score,
      verdict: scan.verdict,
      checkedAt: scan.created_at,
    })),
    stats: {
      totalChecks,
      scamsDetected,
      scamReports: communityReports,
      avgTrustScore,
    },
  };
}
