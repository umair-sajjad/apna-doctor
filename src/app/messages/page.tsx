import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/shared/UserNavbar";
import DirectMessageWindow from "@/components/chat/DirectMessageWindow";
import type { DmConversation } from "@/components/chat/DirectMessageWindow";
import Link from "next/link";
import { Stethoscope } from "lucide-react";

export async function generateMetadata() {
  return { title: "Messages – ApnaDoctor" };
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string; conversationId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/user");

  // Ensure caller is a patient (not a doctor)
  const { data: doctorCheck } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  if (doctorCheck) redirect("/doctor/messages");

  const sp = await searchParams;

  // If a doctorId is passed in the URL, find-or-create that conversation
  // then redirect to the canonical URL with conversationId
  if (sp.doctorId && !sp.conversationId) {
    // Find or create conversation inline (avoids self-calling the API route)
    const { data: existing } = await supabase
      .from("dm_conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("doctor_id", sp.doctorId)
      .single();

    if (existing) {
      redirect(`/messages?conversationId=${existing.id}`);
    } else {
      // Verify doctor exists
      const { data: doc } = await supabase
        .from("doctors")
        .select("id")
        .eq("id", sp.doctorId)
        .single();
      if (doc) {
        const { data: created } = await supabase
          .from("dm_conversations")
          .insert({ user_id: user.id, doctor_id: sp.doctorId })
          .select("id")
          .single();
        if (created) redirect(`/messages?conversationId=${created.id}`);
      }
    }
  }

  // Fetch all conversations for this user
  const { data: convData } = await supabase
    .from("dm_conversations")
    .select(
      `id, last_message_at, last_message_preview, user_unread_count,
       doctors:doctor_id ( id, full_name, profile_image, specialization )`
    )
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  const conversations = (convData ?? []) as unknown as DmConversation[];
  const initialConversationId = sp.conversationId ?? null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <UserNavbar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div
          className="relative mb-6 overflow-hidden rounded-2xl px-8 py-6"
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
          <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                Inbox
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold text-white">
                Messages
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                Chat directly with your doctors
              </p>
            </div>
            <Link
              href="/doctors"
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 sm:mt-0"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <Stethoscope size={15} /> Find a Doctor
            </Link>
          </div>
        </div>

        {/* Chat interface */}
        <DirectMessageWindow
          currentUserId={user.id}
          isDoctor={false}
          conversations={conversations}
          initialConversationId={initialConversationId}
        />
      </div>
    </div>
  );
}
