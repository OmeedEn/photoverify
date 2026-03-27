import { NextResponse } from "next/server";
import { getRecentReports, getAlerts } from "@/lib/scam-feed";

export async function GET() {
  return NextResponse.json({
    reports: getRecentReports(20),
    alerts: getAlerts(),
  });
}
