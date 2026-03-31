import { NextRequest, NextResponse } from "next/server";
import { addReport } from "@/lib/scam-feed";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 5, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many reports. Please wait before submitting again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { category, platform, description } = body;

    if (!category || !platform || !description) {
      return NextResponse.json(
        { error: "Category, platform, and description are required" },
        { status: 400 }
      );
    }

    if (typeof description !== "string" || description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (typeof category !== "string" || typeof platform !== "string") {
      return NextResponse.json(
        { error: "Invalid category or platform" },
        { status: 400 }
      );
    }

    const report = await addReport({ category, platform, description });
    return NextResponse.json(report);
  } catch (error) {
    console.error("Scam report submission failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
