import { NextRequest, NextResponse } from "next/server";
import { addReport } from "@/lib/scam-feed";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, platform, description } = body;

    if (!category || !platform || !description) {
      return NextResponse.json(
        { error: "Category, platform, and description are required" },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    const report = await addReport({ category, platform, description });
    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
