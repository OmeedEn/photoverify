import { NextRequest, NextResponse } from "next/server";
import { reportAsScam, getImage } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId } = body;

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image = getImage(imageId);
    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const success = reportAsScam(imageId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to report image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image reported as scam. Thank you for helping the community.",
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
