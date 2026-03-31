import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DoctorNavbar from "@/components/shared/DoctorNavbar";
import DirectMessageWindow from "@/components/chat/DirectMessageWindow";
import type { DmConversation } from "@/components/chat/DirectMessageWindow";

export async function generateMetadata() {
  return { title: "Messages – ApnaDoctor Doctor Portal" };
}

export default async function DoctorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; conversationId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/doctor");

  // Ensure caller is a doctor
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!doctor) redirect("/login/doctor");

  const sp = await searchParams;

  // If userId in query, find-or-create conversation with that patient
  if (sp.userId && !sp.conversationId) {
    const { data: existing } = await supabase
      .from("dm_conversations")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("user_id", sp.userId)
      .single();

    if (existing) {
      redirect(`/doctor/messages?conversationId=${existing.id}`);
    } else {
      const { data: patient } = await supabase
        .from("users")
        .select("id")
        .eq("id", sp.userId)
        .single();
      if (patient) {
        const { data: created } = await supabase
          .from("dm_conversations")
          .insert({ user_id: sp.userId, doctor_id: user.id })
          .select("id")
          .single();
        if (created) redirect(`/doctor/messages?conversationId=${created.id}`);
      }
    }
  }

  // Fetch all conversations for this doctor
  const { data: convData } = await supabase
    .from("dm_conversations")
    .select(
      `id, last_message_at, last_message_preview, doctor_unread_count,
       users:user_id ( id, full_name, profile_photo )`
    )
    .eq("doctor_id", user.id)
    .order("last_message_at", { ascending: false });

  const conversations = (convData ?? []) as unknown as DmConversation[];
  const initialConversationId = sp.conversationId ?? null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <DoctorNavbar />

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
          <div className="relative z-10">
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              Doctor Portal
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">
              Patient Messages
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Communicate securely with your patients
            </p>
          </div>
        </div>

        {/* Chat interface */}
        <DirectMessageWindow
          currentUserId={user.id}
          isDoctor={true}
          conversations={conversations}
          initialConversationId={initialConversationId}
        />
      </div>
    </div>
  );
}
