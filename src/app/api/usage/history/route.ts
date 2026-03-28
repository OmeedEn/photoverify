import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserScans } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const scans = await getUserScans(user.id, 50);

    return NextResponse.json({ scans });
  } catch (error) {
    console.error("Scan history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan history" },
      { status: 500 }
    );
  }
}
