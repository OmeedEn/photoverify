import { v4 as uuidv4 } from "uuid";
import { createServiceClient } from "@/lib/supabase/service";

export interface ScamReport {
  id: string;
  category: string;
  platform: string;
  description: string;
  reportedAt: string;
  upvotes: number;
}

export interface ScamAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  reportCount: number;
  createdAt: string;
}

interface CommunityReportRow {
  id: string;
  category: string;
  platform: string;
  description: string;
  reported_at: string;
  upvotes: number;
}

const memoryReports: ScamReport[] = [
  {
    id: "4f85ef5e-6834-4a19-9b8a-3da6a8351c11",
    category: "Gaming",
    platform: "Facebook Marketplace",
    description:
      "Same PS5 photo used across 3 different listings in different cities. Seller asked for Zelle payment only.",
    reportedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    upvotes: 24,
  },
  {
    id: "fd728eb1-7453-4561-9af7-3177dc88fd26",
    category: "Electronics",
    platform: "OfferUp",
    description:
      "Stock photo of AirPods Pro being used as a real listing. Image traced back to Apple's website.",
    reportedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    upvotes: 18,
  },
  {
    id: "c992494e-a8b1-4ee0-bf38-c6ff4d88792d",
    category: "Tickets",
    platform: "Reddit",
    description:
      "Concert ticket with duplicate barcode reported by 4 different buyers in the same city.",
    reportedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    upvotes: 42,
  },
  {
    id: "d78f7d35-0a4b-4b6a-90f2-503be8c15d02",
    category: "Electronics",
    platform: "Facebook Marketplace",
    description:
      "iPhone 15 Pro listing using photos pulled directly from an Amazon product page.",
    reportedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    upvotes: 31,
  },
  {
    id: "f4acc0cb-f411-4a03-bf4e-d500b11d54b2",
    category: "Designer Goods",
    platform: "OfferUp",
    description:
      "Designer bag listing using photos stolen from a Poshmark seller. Same background and angle.",
    reportedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    upvotes: 15,
  },
  {
    id: "b4c18877-c81d-4741-b987-96e5f2fcb328",
    category: "Tickets",
    platform: "Facebook Marketplace",
    description:
      "Taylor Swift tickets - same screenshot being sold in 8 different cities. Identical barcode visible.",
    reportedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    upvotes: 87,
  },
];

const alerts: ScamAlert[] = [
  {
    id: uuidv4(),
    title: "Fake concert ticket listings surging",
    description:
      "Reports of fake concert tickets have increased 300% ahead of summer tour season. Always verify before buying.",
    category: "Tickets",
    reportCount: 156,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "Crypto payment scam pattern",
    description:
      "New scam pattern: sellers requesting payment via cryptocurrency for electronics. Legitimate sellers accept standard payment methods.",
    category: "Electronics",
    reportCount: 89,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "Duplicate GPU listings on Reddit",
    description:
      "Duplicate GPU listings spreading across Reddit hardware swap communities. Same photos appearing in multiple posts.",
    category: "Electronics",
    reportCount: 67,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

function mapReportRow(row: CommunityReportRow): ScamReport {
  return {
    id: row.id,
    category: row.category,
    platform: row.platform,
    description: row.description,
    reportedAt: row.reported_at,
    upvotes: row.upvotes,
  };
}

function getMemoryReports(limit: number): ScamReport[] {
  return [...memoryReports]
    .sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    .slice(0, limit);
}

export async function getRecentReports(limit: number = 20): Promise<ScamReport[]> {
  const supabase = createServiceClient();

  if (!supabase) {
    return getMemoryReports(limit);
  }

  const { data, error } = await supabase
    .from("community_reports")
    .select("id, category, platform, description, reported_at, upvotes")
    .order("reported_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Community report fetch failed:", error);
    return getMemoryReports(limit);
  }

  return ((data ?? []) as CommunityReportRow[]).map(mapReportRow);
}

export function getAlerts(): ScamAlert[] {
  return [...alerts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addReport(report: {
  category: string;
  platform: string;
  description: string;
}): Promise<ScamReport> {
  const supabase = createServiceClient();
  const reportedAt = new Date().toISOString();

  if (!supabase) {
    const newReport: ScamReport = {
      id: uuidv4(),
      ...report,
      reportedAt,
      upvotes: 0,
    };
    memoryReports.unshift(newReport);
    return newReport;
  }

  const { data, error } = await supabase
    .from("community_reports")
    .insert({
      id: uuidv4(),
      category: report.category,
      platform: report.platform,
      description: report.description,
      reported_at: reportedAt,
      upvotes: 0,
    })
    .select("id, category, platform, description, reported_at, upvotes")
    .single();

  if (error) {
    console.error("Community report insert failed:", error);
    const newReport: ScamReport = {
      id: uuidv4(),
      ...report,
      reportedAt,
      upvotes: 0,
    };
    memoryReports.unshift(newReport);
    return newReport;
  }

  return mapReportRow(data as CommunityReportRow);
}

export async function upvoteReport(id: string): Promise<boolean> {
  const supabase = createServiceClient();

  if (!supabase) {
    const report = memoryReports.find((item) => item.id === id);
    if (!report) {
      return false;
    }

    report.upvotes += 1;
    return true;
  }

  const { data, error } = await supabase
    .from("community_reports")
    .select("upvotes")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Community report upvote lookup failed:", error);
    const report = memoryReports.find((item) => item.id === id);
    if (!report) {
      return false;
    }

    report.upvotes += 1;
    return true;
  }

  if (!data) {
    return false;
  }

  const row = data as { upvotes: number };

  const { error: updateError } = await supabase
    .from("community_reports")
    .update({ upvotes: row.upvotes + 1 })
    .eq("id", id);

  if (updateError) {
    console.error("Community report upvote failed:", updateError);
    return false;
  }

  return true;
}

export async function getCommunityReportCount(): Promise<number> {
  const supabase = createServiceClient();

  if (!supabase) {
    return memoryReports.length;
  }

  const { count, error } = await supabase
    .from("community_reports")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Community report count failed:", error);
    return memoryReports.length;
  }

  return count ?? 0;
}
