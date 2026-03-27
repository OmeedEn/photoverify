import { NextRequest, NextResponse } from "next/server";
import { upvoteReport } from "@/lib/scam-feed";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const success = upvoteReport(reportId);
    if (!success) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to upvote" },
      { status: 500 }
    );
  }
}
