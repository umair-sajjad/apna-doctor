import Link from "next/link";
import UserNavbar from "@/components/shared/UserNavbar";
import Logo from "@/components/shared/logo";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Contact Us - ApnaDoctor",
  description:
    "Get in touch with the ApnaDoctor team. We're here to help patients, doctors, and partners.",
};

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "support@apnadoctor.pk",
    href: "mailto:support@apnadoctor.pk",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+92 300 0000000",
    href: "tel:+923000000000",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Gulberg III, Lahore, Pakistan",
    href: null,
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon – Sat, 9:00 AM – 6:00 PM PKT",
    href: null,
  },
];

export default function ContactPage() {
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
            Get in Touch
          </div>
          <h1
            className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.1 }}
          >
            We'd Love to{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--accent), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hear from You
            </span>
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Whether you're a patient, a doctor, or just curious — our team is
            here to help.
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

      {/* ── CONTACT GRID ─────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left — info */}
            <div className="flex flex-col gap-8">
              <div>
                <p
                  className="mb-2 text-sm font-semibold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Reach Us
                </p>
                <h2
                  className="font-display text-3xl font-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  Contact Information
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  Reach us through any of the channels below. We typically
                  respond within one business day.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {contactItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      background: "var(--bg-soft)",
                      border: "1px solid var(--primary-light)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "var(--primary-light)" }}
                    >
                      <item.icon
                        size={18}
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-400">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-1 block text-sm font-semibold transition-colors hover:opacity-70"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p
                          className="mt-1 text-sm font-semibold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Doctor callout */}
              <div
                className="relative overflow-hidden rounded-2xl p-6"
                style={{ background: "var(--text-dark)" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
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
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(14,165,233,0.15)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <Stethoscope size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="font-display font-bold text-white">
                    Are you a Doctor?
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Join our network of PMDC-verified doctors and start
                    receiving patients through ApnaDoctor.
                  </p>
                  <Link
                    href="/register/doctor"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    Register as Doctor <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--primary-light)",
              }}
            >
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                Send us a Message
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Fill out the form and we'll get back to you shortly.
              </p>

              <div className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {["First Name", "Last Name"].map((label, i) => (
                    <div key={label}>
                      <label
                        className="block text-xs font-semibold tracking-wide uppercase"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {label}
                      </label>
                      <input
                        type="text"
                        placeholder={i === 0 ? "Ahmed" : "Khan"}
                        className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm transition focus:outline-none"
                        style={{
                          borderColor: "var(--primary-light)",
                          color: "var(--text-dark)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--text-dark)" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ahmed@example.com"
                    className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm transition focus:outline-none"
                    style={{
                      borderColor: "var(--primary-light)",
                      color: "var(--text-dark)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--text-dark)" }}
                  >
                    I am a
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm transition focus:outline-none"
                    style={{
                      borderColor: "var(--primary-light)",
                      color: "var(--text-dark)",
                    }}
                  >
                    <option value="">Select one</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--text-dark)" }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="How can we help you?"
                    className="mt-2 w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm transition focus:outline-none"
                    style={{
                      borderColor: "var(--primary-light)",
                      color: "var(--text-dark)",
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                  }}
                >
                  Send Message
                </button>

                <p className="text-center text-xs text-gray-400">
                  By submitting, you agree to our{" "}
                  <Link
                    href="/privacy"
                    className="transition-colors hover:opacity-70"
                    style={{ color: "var(--primary)" }}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
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
