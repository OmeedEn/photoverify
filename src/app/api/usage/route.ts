import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canUserScan, FREE_SCAN_LIMIT } from "@/lib/usage";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const usage = await canUserScan(user.id);

    return NextResponse.json({
      used: usage.used,
      limit: FREE_SCAN_LIMIT,
      remaining: usage.isPro ? null : usage.remaining,
      isPro: usage.isPro,
      allowed: usage.allowed,
    });
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}
