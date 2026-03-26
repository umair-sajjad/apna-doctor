import Link from "next/link";
import UserNavbar from "@/components/shared/UserNavbar";
import Logo from "@/components/shared/logo";
import { HelpCircle, MessageCircle, ChevronRight } from "lucide-react";

export const metadata = {
  title: "FAQ - ApnaDoctor",
  description:
    "Frequently asked questions about ApnaDoctor — booking appointments, payments, cancellations, and more.",
};

const faqs: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Booking Appointments",
    items: [
      {
        q: "How do I book an appointment?",
        a: "You can book through our AI chat assistant or browse doctors directly. Select a doctor, pick an available time slot, fill in your details, and complete payment — the whole process takes under 5 minutes.",
      },
      {
        q: "Do I need to create an account to book?",
        a: "No, you can book as a guest. However, creating an account lets you view your booking history, manage upcoming appointments, and save favourite doctors.",
      },
      {
        q: "Can I book for someone else?",
        a: "Yes. During the booking flow you can enter a different patient name and contact details. The confirmation SMS and email will go to the contact information you provide.",
      },
      {
        q: "How far in advance can I book?",
        a: "You can book up to 30 days in advance, subject to the doctor's availability settings.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We currently support JazzCash, Easypaisa, and cash-at-clinic (where the doctor has enabled it). Card payments are coming soon.",
      },
      {
        q: "Is my payment information stored?",
        a: "No. We never store card or wallet credentials on our servers. All transactions are processed directly through JazzCash and Easypaisa's secure gateways.",
      },
      {
        q: "Will I get a receipt?",
        a: "Yes. A payment receipt is sent to your email immediately after a successful booking. You can also download it from your appointments page.",
      },
    ],
  },
  {
    category: "Cancellations & Refunds",
    items: [
      {
        q: "What is the cancellation policy?",
        a: "You can cancel any appointment. If you cancel more than 2 hours before the appointment time, you receive an 80% refund. Cancellations within 2 hours or no-shows are non-refundable.",
      },
      {
        q: "How long does a refund take?",
        a: "Refunds are processed within 3–5 business days and credited back to the original payment method (JazzCash or Easypaisa account).",
      },
      {
        q: "Can I reschedule instead of cancelling?",
        a: "Yes. From your appointments page, select the appointment and choose 'Reschedule'. You can pick a new date and time without any additional charge, subject to slot availability.",
      },
    ],
  },
  {
    category: "Doctors & Verification",
    items: [
      {
        q: "How are doctors verified?",
        a: "Every doctor must submit their PMDC registration number, degree certificate, and experience proof. Our team manually verifies these against PMDC records before activating the profile.",
      },
      {
        q: "What does the PMDC Verified badge mean?",
        a: "It means we have confirmed the doctor is currently registered with the Pakistan Medical and Dental Council and their submitted credentials match official records.",
      },
      {
        q: "Can I choose a doctor based on gender?",
        a: "Yes. Use the gender filter on the search page to narrow results to male or female doctors.",
      },
      {
        q: "How do I register as a doctor?",
        a: "Go to the 'Join as Doctor' link in the navigation, complete the multi-step registration form, upload your verification documents, and our team will review your application within 1–2 business days.",
      },
    ],
  },
  {
    category: "AI Assistant",
    items: [
      {
        q: "What languages does the AI assistant support?",
        a: "The assistant understands and responds in both English and Urdu, including natural code-switching between the two.",
      },
      {
        q: "How does the AI match me with doctors?",
        a: "It extracts your symptoms and health concern, identifies the relevant medical specialty, requests your location, and then runs a combined search using geolocation and semantic matching to surface the most relevant verified doctors near you.",
      },
      {
        q: "Is my chat conversation private?",
        a: "Yes. Conversations are stored securely and used only to improve the matching experience. We do not share them with third parties.",
      },
    ],
  },
  {
    category: "Reminders & Notifications",
    items: [
      {
        q: "Will I get a reminder before my appointment?",
        a: "Yes. You receive an SMS and email confirmation immediately after booking, a reminder 2 hours before your appointment, and a final reminder at the scheduled time.",
      },
      {
        q: "Can I turn off notifications?",
        a: "You can manage notification preferences from your account settings. Note that appointment confirmations are always sent regardless of preferences.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <UserNavbar />

      {/* Hero */}
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
            <HelpCircle size={13} />
            Help Center
          </div>
          <h1
            className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.1 }}
          >
            Frequently Asked{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--accent), var(--primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Questions
            </span>
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Everything you need to know about using ApnaDoctor.
          </p>
        </div>
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

      {/* FAQ content */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-14">
            {faqs.map((section) => (
              <div key={section.category}>
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="h-px flex-1"
                    style={{ background: "var(--primary-light)" }}
                  />
                  <h2
                    className="font-display text-lg font-bold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {section.category}
                  </h2>
                  <div
                    className="h-px flex-1"
                    style={{ background: "var(--primary-light)" }}
                  />
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-2xl"
                      style={{
                        background: "var(--bg-soft)",
                        border: "1px solid var(--primary-light)",
                      }}
                    >
                      <summary
                        className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-sm font-semibold transition-colors"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {item.q}
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-open:rotate-180"
                          style={{
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                          }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M2 4L5 7L8 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </summary>
                      <div
                        className="border-t px-6 py-4 text-sm leading-relaxed text-gray-600"
                        style={{ borderColor: "var(--primary-light)" }}
                      >
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div
            className="relative mt-16 overflow-hidden rounded-3xl p-10 text-center"
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
                  "radial-gradient(ellipse at center, var(--accent), transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(14,165,233,0.15)",
                  border: "1px solid rgba(14,165,233,0.2)",
                }}
              >
                <MessageCircle size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Still have questions?
              </h3>
              <p
                className="mt-2 text-sm"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Our support team is available Monday to Saturday, 9 AM – 6 PM
                PKT.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                }}
              >
                Contact Support <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
