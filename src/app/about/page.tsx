import Link from "next/link";
import UserNavbar from "@/components/shared/UserNavbar";
import Logo from "@/components/shared/logo";
import {
  ShieldCheck,
  Eye,
  Globe,
  Bot,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "About Us - ApnaDoctor",
  description:
    "Learn about ApnaDoctor's mission to make quality healthcare accessible across Pakistan through AI-powered doctor discovery and booking.",
};

const stats = [
  { value: "500+", label: "Verified Doctors" },
  { value: "10K+", label: "Happy Patients" },
  { value: "50+", label: "Specializations" },
  { value: "5", label: "Cities Covered" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Verification",
    desc: "Every doctor on our platform is manually verified against PMDC records. We don't list anyone we haven't vetted.",
  },
  {
    icon: Eye,
    title: "Transparency",
    desc: "Consultation fees, doctor credentials, and patient reviews are always visible upfront. No surprises.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    desc: "Built for Pakistan — with Urdu language support, local payment gateways, and coverage across major cities.",
  },
];

const techFeatures = [
  {
    icon: Bot,
    title: "AI Medical Assistant",
    desc: "Fine-tuned on Pakistan-specific medical scenarios. Understands English, Urdu, and natural health descriptions.",
  },
  {
    icon: MapPin,
    title: "Geospatial Search",
    desc: "Finds doctors near you using precise location data, sorted by distance and real-time availability.",
  },
  {
    icon: Star,
    title: "Semantic Matching",
    desc: "Ranks doctors by relevance using vector embeddings — not just keyword matching.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <UserNavbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: "var(--hero-bg)" }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 70% 50%, rgba(14,165,233,0.1) 0%, transparent 60%), linear-gradient(135deg, #050e1f 0%, #0a1628 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.25)",
              color: "var(--accent)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Our Story
          </div>
          <h1
            className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.1 }}
          >
            Making Healthcare{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--accent), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Accessible
            </span>{" "}
            for Every Pakistani
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            ApnaDoctor was built with one goal: remove the friction between
            patients and quality healthcare in Pakistan.
          </p>
        </div>

        {/* Wave */}
        <div className="absolute right-0 bottom-0 left-0 z-10">
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            className="w-full"
            style={{ display: "block", height: "60px" }}
          >
            <path
              d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p
                className="mb-3 text-sm font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Why We Exist
              </p>
              <h2
                className="font-display text-4xl font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                Our Mission
              </h2>
              <p className="mt-6 text-base leading-relaxed text-gray-600">
                Millions of Pakistanis struggle to find the right doctor — not
                because doctors don't exist, but because there's no reliable way
                to discover, verify, and book them. Phone calls go unanswered.
                Recommendations are word-of-mouth. Fees are hidden.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                We built ApnaDoctor to fix that. Using AI that understands both
                English and Urdu, we help patients describe their health concern
                naturally and get matched with verified, PMDC-registered doctors
                near them — instantly.
              </p>
              <Link
                href="/chat"
                className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                }}
              >
                Try the AI Assistant <ChevronRight size={15} />
              </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl p-8 text-center"
                  style={{
                    background:
                      i % 2 === 0 ? "var(--bg-soft)" : "var(--text-dark)",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  {i % 2 !== 0 && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-5"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                  )}
                  <div
                    className="font-display relative z-10 text-4xl font-bold"
                    style={{
                      color: i % 2 === 0 ? "var(--primary)" : "var(--accent)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="relative z-10 mt-2 text-sm font-medium"
                    style={{
                      color:
                        i % 2 === 0
                          ? "var(--text-dark)"
                          : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--bg-soft)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p
              className="mb-3 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Our Principles
            </p>
            <h2
              className="font-display text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              What We Stand For
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="rounded-2xl bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--primary-light)",
                    border: "1px solid rgba(26,111,184,0.15)",
                  }}
                >
                  <v.icon size={22} style={{ color: "var(--primary)" }} />
                </div>
                <h3
                  className="font-display text-lg font-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ───────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p
              className="mb-3 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Under the Hood
            </p>
            <h2
              className="font-display text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              The Technology Behind ApnaDoctor
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
              Our AI assistant is fine-tuned on medical consultation scenarios
              specific to Pakistan's healthcare landscape. It understands the
              way Pakistanis naturally describe their health concerns and
              surfaces the most relevant doctors — all in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {techFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "var(--text-dark)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(14,165,233,0.12)",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <f.icon size={22} style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  {f.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--bg-soft)" }}>
        <div className="mx-auto max-w-4xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-dark) 0%, var(--accent) 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold text-white">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-blue-100">
                Find a verified doctor near you in under a minute.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/chat"
                  className="rounded-xl bg-white px-8 py-4 text-sm font-semibold transition-all hover:bg-blue-50 hover:shadow-lg"
                  style={{ color: "var(--primary-dark)" }}
                >
                  Chat with AI Assistant
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-white/40 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        className="border-t py-16"
        style={{
          background: "var(--hero-bg)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <Logo variant="light" size="md" />
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Pakistan's leading AI-powered healthcare booking platform.
              </p>
            </div>
            {[
              {
                title: "For Patients",
                links: [
                  { label: "Find Doctors", href: "/doctors" },
                  { label: "AI Assistant", href: "/chat" },
                  { label: "Sign Up", href: "/register/user" },
                  { label: "Login", href: "/login/user" },
                ],
              },
              {
                title: "For Doctors",
                links: [
                  { label: "Register as Doctor", href: "/register/doctor" },
                  { label: "Doctor Login", href: "/login/doctor" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Contact Us", href: "/contact" },
                  { label: "About", href: "/about" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} ApnaDoctor. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Built for Pakistan's healthcare future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
