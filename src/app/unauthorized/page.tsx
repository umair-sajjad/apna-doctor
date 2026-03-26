import Link from "next/link";
import { Lock, LogIn, Stethoscope, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg-soft)" }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-center"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        {/* Dark top banner */}
        <div
          className="relative overflow-hidden px-8 py-10"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at center, #eab308, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(234,179,8,0.15)",
                border: "1px solid rgba(234,179,8,0.25)",
              }}
            >
              <Lock size={28} style={{ color: "#fbbf24" }} />
            </div>
            <p
              className="font-display text-6xl font-bold opacity-20"
              style={{ color: "#eab308" }}
            >
              403
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">
              Access Denied
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              You don't have permission to access this page. Please login with
              the appropriate account type.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login/user"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <LogIn size={15} /> Login as User
            </Link>
            <Link
              href="/login/doctor"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-gray-50"
              style={{
                borderColor: "var(--primary-light)",
                color: "var(--text-dark)",
              }}
            >
              <Stethoscope size={15} /> Login as Doctor
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              <Home size={12} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
