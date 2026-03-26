import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/logo";

export const metadata = {
  title: "Terms of Service - ApnaDoctor",
};

const sections = [
  {
    id: "1",
    title: "Introduction",
    content: `Welcome to ApnaDoctor. These Terms of Service ("Terms") govern your access to and use of ApnaDoctor's website, mobile application, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.`,
  },
  {
    id: "2",
    title: "Acceptance of Terms",
    paragraphs: [
      "By creating an account or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.",
      "We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.",
    ],
  },
  {
    id: "3",
    title: "User Accounts",
    subsections: [
      {
        title: "3.1 Account Registration",
        items: [
          "You must provide accurate and complete information when creating an account",
          "You are responsible for maintaining the confidentiality of your account credentials",
          "You must be at least 18 years old to create an account",
          "One person may only create one account",
        ],
      },
      {
        title: "3.2 Doctor Accounts",
        items: [
          "Doctors must provide valid PMDC registration and professional credentials",
          "All doctor accounts are subject to verification before activation",
          "Doctors must maintain active and valid medical licenses",
          "False credentials will result in immediate account termination",
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Service Usage",
    paragraphs: [
      "ApnaDoctor is a platform that connects patients with healthcare providers. We facilitate appointment bookings but do not provide medical services directly.",
    ],
    prohibitedLabel: "You agree NOT to:",
    prohibited: [
      "Use the Service for any illegal or unauthorized purpose",
      "Violate any laws in your jurisdiction",
      "Impersonate any person or entity",
      "Interfere with or disrupt the Service or servers",
      "Attempt to gain unauthorized access to any portion of the Service",
      "Upload viruses or malicious code",
      "Collect user information without consent",
      "Use the Service to spam or send unsolicited messages",
    ],
  },
  {
    id: "5",
    title: "Appointments & Payments",
    subsections: [
      {
        title: "5.1 Booking Appointments",
        intro:
          "Patients can book appointments through our platform. Confirmation is subject to doctor availability and payment completion.",
      },
      {
        title: "5.2 Payment Terms",
        items: [
          "All fees must be paid at the time of booking",
          "Prices are set by individual doctors",
          "ApnaDoctor charges a small platform fee",
          "All payments are processed securely through Stripe",
        ],
      },
      {
        title: "5.3 Cancellation Policy",
        items: [
          "Free cancellation up to 2 hours before appointment",
          "80% refund if cancelled within 2 hours of appointment",
          "No refund for no-shows",
          "Refunds processed within 3-5 business days",
        ],
      },
    ],
  },
  {
    id: "6",
    title: "Medical Disclaimer",
    highlight: true,
    content:
      "IMPORTANT: ApnaDoctor is NOT a healthcare provider. We are a technology platform that connects patients with doctors. We do not provide medical advice, diagnosis, or treatment. All medical services are provided by independent healthcare professionals. Always seek the advice of your physician or qualified health provider with any questions regarding a medical condition.",
  },
  {
    id: "7",
    title: "Intellectual Property",
    content:
      "All content on ApnaDoctor, including text, graphics, logos, images, and software, is the property of ApnaDoctor or its licensors and is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.",
  },
  {
    id: "8",
    title: "Limitation of Liability",
    content:
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, APNADOCTOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.",
  },
  {
    id: "9",
    title: "Termination",
    content:
      "We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.",
  },
  {
    id: "10",
    title: "Governing Law",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of Lahore, Pakistan.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Minimal header */}
      <header
        className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm"
        style={{ borderColor: "var(--primary-light)" }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Logo size="sm" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Page title */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-8"
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
          <div className="relative z-10 flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(14,165,233,0.15)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              <FileText size={22} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                Terms of Service
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Last updated: March 8, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="rounded-2xl bg-white p-8"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id}>
                <h2
                  className="font-display mb-4 text-xl font-bold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {section.id}. {section.title}
                </h2>

                {/* Highlighted disclaimer */}
                {section.highlight && section.content && (
                  <div
                    className="rounded-xl p-5 text-sm leading-relaxed"
                    style={{
                      background: "#fef9c3",
                      borderLeft: "4px solid #eab308",
                      color: "var(--text-dark)",
                    }}
                  >
                    {section.content}
                  </div>
                )}

                {/* Plain content */}
                {!section.highlight && section.content && (
                  <p className="text-sm leading-relaxed text-gray-600">
                    {section.content}
                  </p>
                )}

                {/* Paragraphs */}
                {section.paragraphs && (
                  <div className="space-y-3">
                    {section.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-gray-600"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                )}

                {/* Prohibited list */}
                {section.prohibitedLabel && section.prohibited && (
                  <div className="mt-3">
                    <p
                      className="mb-2 text-sm font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {section.prohibitedLabel}
                    </p>
                    <ul className="space-y-1.5">
                      {section.prohibited.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-gray-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Subsections */}
                {section.subsections && (
                  <div className="space-y-5">
                    {section.subsections.map((sub) => (
                      <div key={sub.title}>
                        <h3
                          className="mb-2 text-sm font-bold"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {sub.title}
                        </h3>
                        {sub.intro && (
                          <p className="mb-2 text-sm text-gray-600">
                            {sub.intro}
                          </p>
                        )}
                        {sub.items && (
                          <ul className="space-y-1.5">
                            {sub.items.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2.5 text-sm text-gray-600"
                              >
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{ background: "var(--primary)" }}
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Contact */}
            <section>
              <h2
                className="font-display mb-4 text-xl font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                11. Contact Information
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <div
                className="space-y-2 rounded-xl p-5 text-sm"
                style={{
                  background: "var(--bg-soft)",
                  border: "1px solid var(--primary-light)",
                }}
              >
                <p style={{ color: "var(--text-dark)" }}>
                  <span className="font-semibold">Email:</span>{" "}
                  <a
                    href="mailto:legal@apnadoctor.pk"
                    style={{ color: "var(--primary)" }}
                  >
                    legal@apnadoctor.pk
                  </a>
                </p>
                <p style={{ color: "var(--text-dark)" }}>
                  <span className="font-semibold">Address:</span> ApnaDoctor,
                  Lahore, Pakistan
                </p>
              </div>
            </section>

            {/* Footer note */}
            <div
              className="border-t pt-6 text-xs text-gray-400 italic"
              style={{ borderColor: "var(--primary-light)" }}
            >
              These Terms of Service were last updated on March 8, 2026. We
              encourage you to review these Terms periodically for any changes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
