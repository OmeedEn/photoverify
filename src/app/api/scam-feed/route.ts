import { NextResponse } from "next/server";
import { getRecentReports, getAlerts } from "@/lib/scam-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    reports: await getRecentReports(20),
    alerts: getAlerts(),
  });
}
