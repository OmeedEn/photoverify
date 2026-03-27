"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, BarChart3, Home, LogOut, Ticket, DollarSign, Fingerprint, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/verify", label: "Verify", icon: Search },
  { href: "/verify-ticket", label: "Tickets", icon: Ticket },
  { href: "/price-check", label: "Price", icon: DollarSign },
  { href: "/challenge", label: "Challenge", icon: Fingerprint },
  { href: "/scam-feed", label: "Feed", icon: AlertTriangle },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(16px) saturate(180%)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span
            className="text-lg tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Photo
            <span style={{ color: "var(--accent)" }}>Verify</span>
          </span>
        </Link>

        {/* Navigation Links + Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    background: isActive ? "var(--accent-glow)" : "transparent",
                    fontFamily: "var(--font-display)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-primary)";
                      e.currentTarget.style.background = "var(--bg-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <ThemeToggle />
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm hidden sm:inline"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                    }}
                  >
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--danger)";
                      e.currentTarget.style.background = "var(--danger-dim)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--accent-glow)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Log in
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
