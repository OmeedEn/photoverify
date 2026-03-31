import { NextRequest, NextResponse } from "next/server";
import { upvoteReport } from "@/lib/scam-feed";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 30, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many votes. Please wait." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { reportId } = body;

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const success = await upvoteReport(reportId);
    if (!success) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upvote failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to upvote" },
      { status: 500 }
    );
  }
}
