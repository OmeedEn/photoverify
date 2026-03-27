import { NextResponse } from "next/server";
import { getRecentResults, getStats } from "@/lib/store";

export async function GET() {
  try {
    const results = getRecentResults(20);
    const stats = getStats();

    return NextResponse.json({
      results,
      stats,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
