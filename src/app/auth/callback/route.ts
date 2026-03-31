import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_REDIRECTS = ["/verify", "/dashboard", "/upgrade", "/scam-feed", "/forensics", "/price-check", "/challenge", "/terms", "/privacy"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/verify";

  // Validate redirect is a safe relative path (prevent open redirect)
  const safeRedirect =
    redirect.startsWith("/") && !redirect.startsWith("//") && ALLOWED_REDIRECTS.some((p) => redirect.startsWith(p))
      ? redirect
      : "/verify";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth code exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}${safeRedirect}`);
}
