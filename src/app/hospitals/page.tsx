import Link from "next/link";
import UserNavbar from "@/components/shared/UserNavbar";
import {
  Building2,
  Search,
  Mail,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Hospitals - ApnaDoctor",
  description: "Hospital discovery and booking on ApnaDoctor — coming soon.",
};

const upcoming = [
  "Browse hospitals by city and specialty",
  "View departments and available consultants",
  "Book outpatient appointments directly",
  "Check emergency and ICU availability",
];

export default function HospitalsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />

      <section className="flex min-h-[calc(100vh-89px)] flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {/* Main card */}
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{ background: "var(--text-dark)" }}
          >
            {/* Dot pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, var(--accent), transparent 60%)",
              }}
            />

            <div className="relative z-10 px-8 py-12 text-center">
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(14,165,233,0.15)",
                  border: "1px solid rgba(14,165,233,0.2)",
                }}
              >
                <Building2 size={36} style={{ color: "var(--accent)" }} />
              </div>

              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{
                  background: "rgba(14,165,233,0.1)",
                  border: "1px solid rgba(14,165,233,0.2)",
                  color: "var(--accent)",
                }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                Coming Soon
              </div>

              <h1 className="font-display text-3xl font-bold text-white">
                Hospital Directory
              </h1>

              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                We're building a comprehensive directory of verified hospitals
                across Pakistan — with department listings, bed availability,
                and direct appointment booking.
              </p>

              {/* Feature list */}
              <ul className="mt-8 space-y-3 text-left">
                {upcoming.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(14,165,233,0.2)" }}
                    >
                      <CheckCircle2
                        size={11}
                        style={{ color: "var(--accent)" }}
                      />
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/doctors"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                  }}
                >
                  <Search size={14} /> Find a Doctor Instead
                </Link>
                <Link
                  href="/contact"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-white/5"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Mail size={14} /> Notify Me
                </Link>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Back to Home <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
