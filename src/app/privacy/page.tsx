import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/logo";

export const metadata = {
  title: "Privacy Policy - ApnaDoctor",
};

const sections = [
  {
    id: "1",
    title: "Introduction",
    content: `At ApnaDoctor, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.`,
  },
  {
    id: "2",
    title: "Information We Collect",
    subsections: [
      {
        title: "2.1 Personal Information",
        intro: "We collect information that you provide directly to us:",
        items: [
          "Name, email address, and phone number",
          "Date of birth and gender",
          "Profile photo (optional)",
          "Payment information (processed securely by Stripe)",
          "Medical information you choose to share for appointments",
        ],
      },
      {
        title: "2.2 Doctor Information",
        intro: "For healthcare providers, we additionally collect:",
        items: [
          "PMDC registration number",
          "Medical qualifications and certifications",
          "Clinic information and location",
          "Specialization and experience",
          "Professional documents for verification",
        ],
      },
      {
        title: "2.3 Automatically Collected Information",
        items: [
          "IP address and device information",
          "Browser type and operating system",
          "Pages visited and time spent on our platform",
          "Location data (with your permission)",
          "Cookies and similar tracking technologies",
        ],
      },
    ],
  },
  {
    id: "3",
    title: "How We Use Your Information",
    intro: "We use the information we collect to:",
    items: [
      "Provide, maintain, and improve our services",
      "Process and manage appointment bookings",
      "Send appointment reminders and notifications",
      "Verify doctor credentials and qualifications",
      "Process payments and prevent fraud",
      "Respond to your questions and support requests",
      "Send marketing communications (with your consent)",
      "Analyze usage patterns to improve user experience",
      "Comply with legal obligations",
    ],
  },
  {
    id: "4",
    title: "How We Share Your Information",
    subsections: [
      {
        title: "4.1 With Healthcare Providers",
        intro:
          "When you book an appointment, we share your name, contact information, and relevant medical details with the doctor.",
      },
      {
        title: "4.2 With Service Providers",
        intro: "We share data with trusted third parties who help us operate:",
        items: [
          "Stripe (payment processing)",
          "Twilio (SMS notifications)",
          "Resend (email services)",
          "Google Maps (location services)",
          "Supabase (database hosting)",
        ],
      },
      {
        title: "4.3 For Legal Reasons",
        intro:
          "We may disclose information if required by law, court order, or to protect our rights and safety.",
      },
    ],
  },
  {
    id: "5",
    title: "Data Security",
    content:
      "We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
    highlight: true,
  },
  {
    id: "6",
    title: "Your Rights",
    intro: "You have the right to:",
    items: [
      "Access your personal information",
      "Correct inaccurate or incomplete data",
      "Request deletion of your account and data",
      "Object to processing of your personal information",
      "Export your data in a portable format",
      "Opt-out of marketing communications",
      "Withdraw consent at any time",
    ],
    footer:
      "To exercise these rights, please contact us at privacy@apnadoctor.pk",
  },
  {
    id: "7",
    title: "Cookies and Tracking",
    content:
      "We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until deleted).",
  },
  {
    id: "8",
    title: "Children's Privacy",
    content:
      "Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.",
  },
  {
    id: "9",
    title: "Data Retention",
    content:
      "We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.",
  },
  {
    id: "10",
    title: "International Data Transfers",
    content:
      "Your information may be transferred to and maintained on servers located outside of Pakistan. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.",
  },
  {
    id: "11",
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the Last Updated date. You are advised to review this Privacy Policy periodically for any changes.",
  },
];

export default function PrivacyPage() {
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
              <Shield size={22} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                Privacy Policy
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

                {section.highlight && section.content && (
                  <div
                    className="rounded-xl p-5 text-sm leading-relaxed"
                    style={{
                      background: "var(--primary-light)",
                      borderLeft: "4px solid var(--primary)",
                      color: "var(--text-dark)",
                    }}
                  >
                    {section.content}
                  </div>
                )}

                {!section.highlight && section.content && (
                  <p className="text-sm leading-relaxed text-gray-600">
                    {section.content}
                  </p>
                )}

                {section.intro && !section.subsections && (
                  <p className="mb-3 text-sm text-gray-600">{section.intro}</p>
                )}

                {section.items && (
                  <ul className="space-y-1.5">
                    {section.items.map((item) => (
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

                {section.footer && (
                  <p className="mt-4 text-sm text-gray-500">{section.footer}</p>
                )}

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

            {/* Contact section */}
            <section>
              <h2
                className="font-display mb-4 text-xl font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                12. Contact Us
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                If you have any questions about this Privacy Policy, please
                contact us:
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
                    href="mailto:privacy@apnadoctor.pk"
                    style={{ color: "var(--primary)" }}
                  >
                    privacy@apnadoctor.pk
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
              This Privacy Policy was last updated on March 8, 2026. We
              encourage you to review this policy periodically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
