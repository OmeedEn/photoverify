import { NextRequest, NextResponse } from "next/server";
import { analyzePrice, CATEGORIES } from "@/lib/price-check";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RATE_LIMIT = { limit: 30, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { category, price } = body;

    if (!category || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Valid category and price are required" },
        { status: 400 }
      );
    }

    if (!CATEGORIES[category]) {
      return NextResponse.json(
        { error: "Unknown category" },
        { status: 400 }
      );
    }

    const result = analyzePrice(category, price);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Price check failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Price check failed" },
      { status: 500 }
    );
  }
}
