// ── messages/page.tsx ────────────────────────────────────────────────────────
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/shared/UserNavbar";
import Link from "next/link";
import { MessageCircle, Stethoscope } from "lucide-react";

export async function generateMetadata() {
  return { title: "Messages - ApnaDoctor" };
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/user");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-2xl px-8 py-7"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
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
            <p
              className="text-sm font-medium"
              style={{ color: "var(--accent)" }}
            >
              Inbox
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">
              Messages
            </h1>
            <p
              className="mt-0.5 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Your conversations with doctors
            </p>
          </div>
        </div>

        {/* Empty state */}
        <div
          className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--primary-light)" }}
          >
            <MessageCircle size={26} style={{ color: "var(--primary)" }} />
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-dark)" }}
          >
            No messages yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-gray-400">
            After booking an appointment, you'll be able to message your doctor
            here.
          </p>
          <Link
            href="/doctors"
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
            }}
          >
            <Stethoscope size={13} /> Find a Doctor
          </Link>
        </div>
      </div>
    </div>
  );
}
