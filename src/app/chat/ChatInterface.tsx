"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import {
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  Star,
  MapPin,
  ChevronRight,
  Bot,
  User,
  Menu,
  X,
  Clock,
  Stethoscope,
  Trash2,
  CheckCircle,
  Calendar,
  CreditCard,
  Copy,
  ArrowRight,
} from "lucide-react";
import { ChatApiResponse, DoctorResult, SlotsByDate } from "@/types/chat";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  options?: string[];
  doctors?: DoctorResult[];
  slots?: SlotsByDate;
  isError?: boolean;
  booking?: {
    booking_reference: string;
    doctor_name: string;
    date: string;
    time: string;
    clinic_name: string;
    consultation_fee: number;
  };
  timestamp?: string;
}

interface ConversationSummary {
  id: string;
  title: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hello! I'm your ApnaDoctor AI assistant. Describe your health concern in English or Urdu and I'll match you with the right verified doctor near you.",
  options: [
    "I have a symptom",
    "Need a specialist",
    "Regular checkup",
    "For my child",
  ],
  timestamp: new Date().toISOString(),
};

const QUICK_PROMPTS = [
  "I have a skin rash",
  "Need a heart checkup",
  "My child has fever",
  "Back pain for 2 weeks",
  "Dental pain",
  "Eye problem",
];

const DRAFT_KEY = (id: string) => `chat_draft_${id}`;
const ACTIVE_CONV_KEY = "chat_active_conversation_id";
// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(isoString?: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function BookingCard({
  booking,
}: {
  booking: {
    booking_reference: string;
    doctor_name: string;
    date: string;
    time: string;
    clinic_name: string;
    consultation_fee: number;
  };
}) {
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(booking.booking_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(booking.date + "T00:00:00").toLocaleDateString(
    "en-PK",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const [h, m] = booking.time.split(":").map(Number);
  const formattedTime = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;

  return (
    <div
      className="max-w-sm overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--primary-light)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 text-center"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        }}
      >
        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <CheckCircle size={16} className="text-white" />
        </div>
        <p className="text-xs font-semibold text-white">
          Appointment Reserved!
        </p>
      </div>

      {/* Details */}
      <div className="space-y-2 p-4" style={{ background: "var(--bg-soft)" }}>
        <div className="flex items-center gap-2">
          <Stethoscope size={13} style={{ color: "var(--primary)" }} />
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--text-dark)" }}
          >
            {booking.doctor_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={13} style={{ color: "var(--primary)" }} />
          <p className="text-xs text-gray-600">
            {formattedDate} · {formattedTime}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={13} style={{ color: "var(--primary)" }} />
          <p className="text-xs text-gray-600">{booking.clinic_name}</p>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard size={13} style={{ color: "var(--primary)" }} />
          <p className="text-xs font-semibold text-green-600">
            PKR {booking.consultation_fee.toLocaleString()}
          </p>
        </div>

        {/* Booking reference */}
        <div
          className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
          style={{
            background: "white",
            border: "1px solid var(--primary-light)",
          }}
        >
          <div>
            <p className="text-[10px] text-gray-400">Booking Reference</p>
            <p
              className="text-xs font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              {booking.booking_reference}
            </p>
          </div>
          <button
            onClick={copyRef}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-gray-100"
            title="Copy reference"
          >
            <Copy
              size={12}
              style={{ color: copied ? "#059669" : "var(--primary)" }}
            />
          </button>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        className="border-t px-4 py-3"
        style={{ borderColor: "var(--primary-light)", background: "white" }}
      >
        <Link
          href="/appointments"
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          Complete Payment in Dashboard
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  // ── Conversation state ──────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState<string>("");
  const conversationIdRef = useRef<string>("");

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSentInitialQuery = useRef(false);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // ── Draft helpers ───────────────────────────────────────────────────────────
  const saveDraft = useCallback((id: string, text: string) => {
    if (!id) return;
    if (text) {
      localStorage.setItem(DRAFT_KEY(id), text);
    } else {
      localStorage.removeItem(DRAFT_KEY(id));
    }
  }, []);

  const restoreDraft = useCallback((id: string): string => {
    if (!id || typeof window === "undefined") return "";
    return localStorage.getItem(DRAFT_KEY(id)) ?? "";
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (conversationId) saveDraft(conversationId, val);
  };

  useEffect(() => {
    return () => {
      const id = conversationIdRef.current;
      const val = inputRef.current?.value ?? "";
      saveDraft(id, val);
    };
  }, [saveDraft]);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Fetch conversation list ─────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // non-critical
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // ── Load messages for a conversation ───────────────────────────────────────
  const loadConversationMessages = useCallback(async (id: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/conversations/${id}/messages`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const dbMessages: Message[] = (data.messages ?? []).map(
        (m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })
      );
      setMessages(dbMessages.length > 0 ? dbMessages : [WELCOME_MESSAGE]);
    } catch {
      setMessages([WELCOME_MESSAGE]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ── Bootstrap on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });
      },
      () => {
        // Permission denied or unavailable — silently ignore
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    fetchConversations();

    if (initialQuery.trim()) {
      if (hasSentInitialQuery.current) return;
      hasSentInitialQuery.current = true;

      const newId = uuidv4();
      setConversationId(newId);
      conversationIdRef.current = newId;
      sessionStorage.setItem(ACTIVE_CONV_KEY, newId);
      handleSend(initialQuery, undefined, undefined, newId);
      return;
    }

    const stored = sessionStorage.getItem(ACTIVE_CONV_KEY);
    if (stored) {
      setConversationId(stored);
      loadConversationMessages(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core send handler ───────────────────────────────────────────────────────
  const handleSend = async (
    message: string,
    action?: string,
    payload?: Record<string, string>,
    overrideId?: string
  ) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    let activeId = overrideId ?? conversationIdRef.current;
    if (!activeId) {
      activeId = uuidv4();
      setConversationId(activeId);
      conversationIdRef.current = activeId;
      sessionStorage.setItem(ACTIVE_CONV_KEY, activeId);
    }

    saveDraft(activeId, "");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, timestamp: new Date().toISOString() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const [res] = await Promise.all([
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            conversationId: activeId,
            action,
            payload,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      const data: ChatApiResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          doctors: data.doctors,
          slots: data.slots,
          booking: data.booking,
          timestamp: new Date().toISOString(),
        },
      ]);

      fetchConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleOption = (option: string) => handleSend(option);

  const handleSelectDoctor = (doctorId: string, doctorName: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `I'd like to book Dr. ${doctorName}` },
    ]);
    handleSend(`Selected Dr. ${doctorName}`, "select_doctor", {
      doctor_id: doctorId,
    });
  };

  const handleSelectSlot = (date: string, time: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `I want ${date} at ${time}` },
    ]);
    handleSend(`Selected slot ${date} at ${time}`, "select_slot", {
      date,
      time,
    });
  };

  // ── New conversation ────────────────────────────────────────────────────────
  const startNewChat = useCallback(() => {
    saveDraft(conversationId, input);

    const newId = uuidv4();
    setConversationId(newId);
    sessionStorage.setItem(ACTIVE_CONV_KEY, newId);

    setMessages([WELCOME_MESSAGE]);
    setInput(restoreDraft(newId));
    setSidebarOpen(false);
    inputRef.current?.focus();
  }, [conversationId, input, saveDraft, restoreDraft]);

  // ── Switch conversation ─────────────────────────────────────────────────────
  const switchConversation = useCallback(
    (id: string) => {
      if (id === conversationId) {
        setSidebarOpen(false);
        return;
      }

      saveDraft(conversationId, input);
      setConversationId(id);
      sessionStorage.setItem(ACTIVE_CONV_KEY, id);
      setSidebarOpen(false);
      setInput(restoreDraft(id));
      loadConversationMessages(id);
    },
    [conversationId, input, saveDraft, restoreDraft, loadConversationMessages]
  );

  // ── Delete conversation ─────────────────────────────────────────────────────
  const deleteConversation = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();

      setConversations((prev) => prev.filter((c) => c.id !== id));

      if (id === conversationId) {
        const newId = uuidv4();
        setConversationId(newId);
        sessionStorage.setItem(ACTIVE_CONV_KEY, newId);
        setMessages([WELCOME_MESSAGE]);
        setInput("");
      }

      try {
        const res = await fetch(`/api/chat/conversations/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
      } catch {
        fetchConversations();
      }
    },
    [conversationId, fetchConversations]
  );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeConversationTitle =
    conversations.find((c) => c.id === conversationId)?.title ?? null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-[89px] bottom-0 left-0 z-30 flex min-h-0 w-72 flex-col transition-transform duration-300 md:relative md:top-auto md:bottom-auto md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--hero-bg)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-4 py-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <Bot size={16} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-semibold text-white">AI Chat</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white md:hidden"
          >
            <X size={14} />
          </button>
        </div>

        {/* New chat button */}
        <div className="shrink-0 px-3 py-3">
          <button
            onClick={startNewChat}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
            }}
          >
            <Plus size={15} />
            New Conversation
          </button>
        </div>

        {/* Chat history — this is the only scrollable part */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p
            className="mb-2 px-1 text-xs font-semibold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Recent Chats
          </p>

          {isLoadingConversations ? (
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl px-3 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-3/4 rounded bg-white/10" />
                      <div className="h-2 w-1/2 rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <MessageSquare
                size={24}
                style={{ color: "rgba(255,255,255,0.15)" }}
              />
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                No previous conversations.
                <br />
                Start one above!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const isActive = conv.id === conversationId;
                return (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => switchConversation(conv.id)}
                      className="w-full rounded-xl px-3 py-3 text-left transition-all"
                      style={
                        isActive
                          ? {
                              background: "rgba(14,165,233,0.15)",
                              border: "1px solid rgba(14,165,233,0.2)",
                            }
                          : {
                              background: "transparent",
                              border: "1px solid transparent",
                            }
                      }
                    >
                      <div className="flex items-start gap-2.5">
                        <MessageSquare
                          size={13}
                          className="mt-0.5 shrink-0"
                          style={{
                            color: isActive
                              ? "var(--accent)"
                              : "rgba(255,255,255,0.3)",
                          }}
                        />
                        <div className="min-w-0 flex-1 pr-5">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="truncate text-xs font-semibold"
                              style={{
                                color: isActive
                                  ? "var(--accent)"
                                  : "rgba(255,255,255,0.75)",
                              }}
                            >
                              {conv.title ?? "New conversation"}
                            </p>
                          </div>
                          <p
                            className="mt-0.5 text-[10px]"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            {formatRelativeTime(conv.last_message_at)}
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20"
                      title="Delete conversation"
                    >
                      <Trash2
                        size={11}
                        style={{ color: "rgba(255,80,80,0.8)" }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <div
          className="shrink-0 border-t px-4 py-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Link
            href="/doctors"
            className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <Stethoscope size={12} />
            Browse doctors directly
            <ChevronRight size={11} className="ml-auto" />
          </Link>
        </div>
      </aside>

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        {/* Chat topbar */}
        <div
          className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--primary-light)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 md:hidden"
          >
            <Menu size={16} />
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--primary-light)" }}
          >
            <Sparkles size={14} style={{ color: "var(--primary)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--text-dark)" }}
            >
              {activeConversationTitle ?? "ApnaDoctor Assistant"}
            </p>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              AI-powered · PMDC-verified doctors
            </p>
          </div>

          <button
            onClick={startNewChat}
            className="hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:bg-gray-50 md:flex"
            style={{
              borderColor: "var(--primary-light)",
              color: "var(--primary)",
            }}
            title="Start new conversation"
          >
            <Plus size={12} />
            New chat
          </button>
        </div>

        {/* Messages area — the only scrollable part in the chat column */}
        {isLoadingMessages ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div
                className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: "var(--primary-light)",
                  borderTopColor: "var(--primary)",
                }}
              />
              <p className="text-xs">Loading conversation…</p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-8 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="mt-1 mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <Bot size={13} style={{ color: "var(--primary)" }} />
                  </div>
                )}

                <div className="max-w-[80%] space-y-3">
                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, var(--primary), var(--accent))",
                            color: "white",
                            borderBottomRightRadius: "4px",
                          }
                        : msg.isError
                          ? {
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              borderBottomLeftRadius: "4px",
                            }
                          : {
                              background: "var(--bg-soft)",
                              color: "var(--text-dark)",
                              border: "1px solid var(--primary-light)",
                              borderBottomLeftRadius: "4px",
                            }
                    }
                  >
                    {msg.content}
                  </div>

                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleOption(opt)}
                          disabled={loading}
                          className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
                          style={{
                            borderColor: "var(--primary-light)",
                            color: "var(--primary)",
                            background: "white",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.doctors && msg.doctors.length > 0 && (
                    <div className="space-y-2">
                      {msg.doctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md"
                          style={{ borderColor: "var(--primary-light)" }}
                        >
                          <div className="flex items-center gap-3 p-3">
                            <div
                              className="h-10 w-10 shrink-0 overflow-hidden rounded-xl"
                              style={{ background: "var(--primary-light)" }}
                            >
                              {doc.profile_image ? (
                                <img
                                  src={doc.profile_image}
                                  alt={doc.full_name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <div
                                className={`flex h-full w-full items-center justify-center text-sm font-bold ${doc.profile_image ? "hidden" : ""}`}
                                style={{ color: "var(--primary)" }}
                              >
                                {doc.full_name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-sm font-bold"
                                style={{ color: "var(--text-dark)" }}
                              >
                                {doc.full_name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--accent)" }}
                              >
                                {doc.specialization}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <MapPin size={10} />
                                  {doc.city}
                                  {doc.distance_meters && (
                                    <span className="ml-1 font-medium text-green-600">
                                      ({(doc.distance_meters / 1000).toFixed(1)}{" "}
                                      km)
                                    </span>
                                  )}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <Star
                                    size={10}
                                    className="fill-yellow-400 text-yellow-400"
                                  />
                                  {doc.average_rating}
                                </span>
                                <span
                                  className="text-[11px] font-semibold"
                                  style={{ color: "#059669" }}
                                >
                                  PKR {doc.consultation_fee.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleSelectDoctor(doc.id, doc.full_name)
                              }
                              disabled={loading}
                              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--primary), var(--accent))",
                              }}
                            >
                              Select
                            </button>
                          </div>
                          <div
                            className="border-t px-3 py-2"
                            style={{
                              borderColor: "var(--primary-light)",
                              background: "var(--bg-soft)",
                            }}
                          >
                            <Link
                              href={`/doctors/${doc.id}`}
                              className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                              style={{ color: "var(--primary)" }}
                            >
                              View full profile <ChevronRight size={10} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.slots && Object.keys(msg.slots).length > 0 && (
                    <div className="max-w-sm space-y-3">
                      {Object.entries(msg.slots).map(([date, times]) => {
                        const morning = (times as string[]).filter((t) => {
                          const h = parseInt(t.split(":")[0]);
                          return h < 12;
                        });
                        const afternoon = (times as string[]).filter((t) => {
                          const h = parseInt(t.split(":")[0]);
                          return h >= 12 && h < 17;
                        });
                        const evening = (times as string[]).filter((t) => {
                          const h = parseInt(t.split(":")[0]);
                          return h >= 17;
                        });

                        const formatTime = (time: string) => {
                          const [h, m] = time.split(":").map(Number);
                          return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                        };

                        const SlotGroup = ({
                          label,
                          emoji,
                          slots,
                        }: {
                          label: string;
                          emoji: string;
                          slots: string[];
                        }) => {
                          if (slots.length === 0) return null;
                          return (
                            <div>
                              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                                {emoji} {label}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {slots.map((time) => (
                                  <button
                                    key={time}
                                    onClick={() => handleSelectSlot(date, time)}
                                    disabled={loading}
                                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
                                    style={{
                                      borderColor: "var(--primary-light)",
                                      color: "var(--primary)",
                                      background: "white",
                                    }}
                                  >
                                    {formatTime(time)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        };

                        return (
                          <div
                            key={date}
                            className="overflow-hidden rounded-2xl border"
                            style={{ borderColor: "var(--primary-light)" }}
                          >
                            {/* Date header */}
                            <div
                              className="flex items-center gap-2 px-4 py-2.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--primary), var(--accent))",
                              }}
                            >
                              <Calendar size={12} className="text-white" />
                              <p className="text-xs font-semibold text-white">
                                {new Date(
                                  date + "T00:00:00"
                                ).toLocaleDateString("en-PK", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>

                            {/* Slot groups */}
                            <div
                              className="space-y-3 p-4"
                              style={{ background: "var(--bg-soft)" }}
                            >
                              <SlotGroup
                                label="Morning"
                                emoji="🌅"
                                slots={morning}
                              />
                              <SlotGroup
                                label="Afternoon"
                                emoji="☀️"
                                slots={afternoon}
                              />
                              <SlotGroup
                                label="Evening"
                                emoji="🌆"
                                slots={evening}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {msg.booking && <BookingCard booking={msg.booking} />}
                  {msg.timestamp && (
                    <p
                      className={`text-[10px] text-gray-400 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  )}
                </div>

                {msg.role === "user" && (
                  <div
                    className="mt-1 ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <User size={13} style={{ color: "var(--primary)" }} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="mt-1 mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Bot size={13} style={{ color: "var(--primary)" }} />
                </div>
                <div
                  className="flex items-center gap-1 rounded-2xl px-4 py-3"
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--primary-light)",
                    borderBottomLeftRadius: "4px",
                  }}
                >
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-2 w-2 animate-bounce rounded-full"
                      style={{
                        background: "var(--primary)",
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Quick prompts — only on fresh conversations */}
        {!isLoadingMessages && messages.length <= 1 && (
          <div
            className="shrink-0 border-t px-6 py-6"
            style={{ borderColor: "var(--primary-light)" }}
          >
            <div className="mx-auto max-w-lg">
              {/* Header */}
              <div className="mb-4 text-center">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Sparkles size={20} style={{ color: "var(--primary)" }} />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  How can I help you today?
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Choose a concern below or describe your symptoms
                </p>
              </div>

              {/* Prompt cards grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  {
                    label: "Skin rash or acne",
                    emoji: "🩺",
                    prompt: "I have a skin rash",
                  },
                  {
                    label: "Heart checkup",
                    emoji: "❤️",
                    prompt: "Need a heart checkup",
                  },
                  {
                    label: "Child has fever",
                    emoji: "👶",
                    prompt: "My child has fever",
                  },
                  {
                    label: "Back or joint pain",
                    emoji: "🦴",
                    prompt: "Back pain for 2 weeks",
                  },
                  { label: "Dental pain", emoji: "🦷", prompt: "Dental pain" },
                  { label: "Eye problem", emoji: "👁️", prompt: "Eye problem" },
                ].map(({ label, emoji, prompt }) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
                    style={{
                      borderColor: "var(--primary-light)",
                      background: "var(--bg-soft)",
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span
                      className="text-xs leading-tight font-medium"
                      style={{ color: "var(--text-dark)" }}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Doctor search shortcut */}
              <div
                className="mt-3 flex items-center gap-2 rounded-xl border px-4 py-2.5"
                style={{
                  borderColor: "var(--primary-light)",
                  background: "var(--bg-soft)",
                }}
              >
                <Stethoscope size={13} style={{ color: "var(--accent)" }} />
                <p className="text-xs text-gray-500">
                  Looking for a specific doctor?{" "}
                  <button
                    onClick={() =>
                      handleSend("I want to find a doctor by name")
                    }
                    className="font-semibold underline-offset-2 hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Search by name
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div
          className="shrink-0 border-t p-4"
          style={{ borderColor: "var(--primary-light)" }}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div
              className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-2"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--primary-light)",
              }}
            >
              <Sparkles size={15} style={{ color: "var(--accent)" }} />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your health concern…"
                disabled={loading || isLoadingMessages}
                className="flex-1 bg-transparent py-1 text-sm focus:outline-none disabled:opacity-50"
                style={{ color: "var(--text-dark)" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim() || isLoadingMessages}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <Send size={15} />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            AI responses are for guidance only — always consult a verified
            doctor.
          </p>
        </div>
      </div>
    </div>
  );
}
