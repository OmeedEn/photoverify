import { NextRequest, NextResponse } from "next/server";
import { reportAsScam, getImage } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT = { limit: 10, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many reports. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Require authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to report an image." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageId } = body;

    if (!imageId || typeof imageId !== "string") {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image = await getImage(imageId);
    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const success = await reportAsScam(imageId);
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
    console.error("Report failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
