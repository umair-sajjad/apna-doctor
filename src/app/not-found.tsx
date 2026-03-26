import Link from "next/link";
import { Home, Search, Bot, LayoutDashboard } from "lucide-react";

export default function NotFound() {
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
            className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at right, var(--accent), transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(14,165,233,0.12)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              <Search size={28} style={{ color: "var(--accent)" }} />
            </div>
            <p
              className="font-display text-6xl font-bold opacity-20"
              style={{ color: "var(--accent)" }}
            >
              404
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">
              Page Not Found
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <Home size={15} />
              Back to Home
            </Link>
            <Link
              href="/doctors"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-gray-50"
              style={{
                borderColor: "var(--primary-light)",
                color: "var(--text-dark)",
              }}
            >
              <Search size={15} />
              Find Doctors
            </Link>
          </div>

          {/* Quick links */}
          <div
            className="mt-6 rounded-xl p-4"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--primary-light)",
            }}
          >
            <p
              className="mb-3 text-xs font-semibold"
              style={{ color: "var(--text-dark)" }}
            >
              You might be looking for
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { href: "/doctors", icon: Search, label: "Browse Doctors" },
                { href: "/chat", icon: Bot, label: "AI Chat" },
                {
                  href: "/dashboard",
                  icon: LayoutDashboard,
                  label: "Dashboard",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{
                    background: "white",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  <item.icon size={16} style={{ color: "var(--primary)" }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
