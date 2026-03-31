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

const MAX_MEMORY_REPORTS = 500;

const memoryReports: ScamReport[] = [];

const alerts: ScamAlert[] = [];

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
    if (memoryReports.length > MAX_MEMORY_REPORTS) {
      memoryReports.length = MAX_MEMORY_REPORTS;
    }
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
    if (memoryReports.length > MAX_MEMORY_REPORTS) {
      memoryReports.length = MAX_MEMORY_REPORTS;
    }
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
