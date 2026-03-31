"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Send,
  Paperclip,
  X,
  ChevronLeft,
  User,
  Loader2,
  Download,
  FileText,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DmMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "user" | "doctor";
  content: string | null;
  message_type: "text" | "image" | "document";
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
}

export interface DmConversation {
  id: string;
  last_message_at: string;
  last_message_preview: string | null;
  user_unread_count?: number;
  doctor_unread_count?: number;
  // For user view
  doctors?: {
    id: string;
    full_name: string;
    profile_image: string | null;
    specialization: string;
  } | null;
  // For doctor view
  users?: {
    id: string;
    full_name: string;
    profile_photo: string | null;
  } | null;
}

interface Props {
  currentUserId: string;
  isDoctor: boolean;
  conversations: DmConversation[];
  initialConversationId?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric" });
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getContactInfo(conv: DmConversation, isDoctor: boolean) {
  if (isDoctor && conv.users) {
    return {
      name: conv.users.full_name,
      subtitle: "Patient",
      avatar: conv.users.profile_photo,
    };
  }
  if (!isDoctor && conv.doctors) {
    return {
      name: `Dr. ${conv.doctors.full_name}`,
      subtitle: conv.doctors.specialization,
      avatar: conv.doctors.profile_image,
    };
  }
  return { name: "Unknown", subtitle: "", avatar: null };
}

function getUnread(conv: DmConversation, isDoctor: boolean) {
  return isDoctor ? (conv.doctor_unread_count ?? 0) : (conv.user_unread_count ?? 0);
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMine,
  showDate,
  dateLabel,
}: {
  msg: DmMessage;
  isMine: boolean;
  showDate: boolean;
  dateLabel: string;
}) {
  return (
    <>
      {showDate && (
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "var(--primary-light)" }} />
          <span className="text-xs font-medium text-gray-400">{dateLabel}</span>
          <div className="h-px flex-1" style={{ background: "var(--primary-light)" }} />
        </div>
      )}

      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1.5`}>
        <div
          className={`group relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
            isMine
              ? "rounded-br-sm text-white"
              : "rounded-bl-sm bg-white text-gray-800"
          }`}
          style={
            isMine
              ? { background: "linear-gradient(135deg, var(--primary), var(--accent))" }
              : { border: "1px solid var(--primary-light)" }
          }
        >
          {/* Text message */}
          {msg.message_type === "text" && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {msg.content}
            </p>
          )}

          {/* Image message */}
          {msg.message_type === "image" && msg.file_url && (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={msg.file_url}
                  alt={msg.file_name || "Image"}
                  width={280}
                  height={200}
                  className="block max-w-full rounded-xl object-cover transition-opacity hover:opacity-90"
                  style={{ maxHeight: 200 }}
                />
              </div>
              {msg.file_name && (
                <p className={`mt-1 text-xs ${isMine ? "text-white/70" : "text-gray-400"}`}>
                  {msg.file_name}
                </p>
              )}
            </a>
          )}

          {/* Document message */}
          {msg.message_type === "document" && msg.file_url && (
            <a
              href={msg.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl p-3 transition-opacity hover:opacity-80 ${
                isMine ? "bg-white/15" : "bg-blue-50"
              }`}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={isMine ? { background: "rgba(255,255,255,0.25)" } : { background: "var(--primary-light)" }}
              >
                <FileText size={18} style={isMine ? { color: "white" } : { color: "var(--primary)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${isMine ? "text-white" : "text-gray-800"}`}>
                  {msg.file_name || "Document"}
                </p>
                <p className={`text-xs ${isMine ? "text-white/60" : "text-gray-400"}`}>
                  {formatFileSize(msg.file_size)}{" "}
                  {msg.file_type && `· ${msg.file_type.split("/").pop()?.toUpperCase()}`}
                </p>
              </div>
              <Download size={14} className={isMine ? "text-white/70" : "text-gray-400"} />
            </a>
          )}

          {/* Timestamp */}
          <div className={`mt-1 flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] ${isMine ? "text-white/60" : "text-gray-400"}`}>
              {formatMessageTime(msg.created_at)}
            </span>
            {isMine && (
              <CheckCheck size={12} className="text-white/70" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = 40,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--primary), var(--accent))",
        fontSize: size < 32 ? 10 : 13,
      }}
    >
      {initials || <User size={size * 0.4} />}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DirectMessageWindow({
  currentUserId,
  isDoctor,
  conversations: initialConversations,
  initialConversationId,
}: Props) {
  const [conversations, setConversations] = useState<DmConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(!!initialConversationId);

  // File attachment state
  const [pendingFile, setPendingFile] = useState<{
    file: File;
    previewUrl: string | null;
    messageType: "image" | "document";
  } | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  // ── Load messages for active conversation ──────────────────────────────────
  const loadMessages = useCallback(
    async (convId: string, before?: string) => {
      const url = `/api/messages/conversations/${convId}/messages${before ? `?before=${encodeURIComponent(before)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json() as Promise<{ messages: DmMessage[]; hasMore: boolean }>;
    },
    []
  );

  // ── Select a conversation ──────────────────────────────────────────────────
  const selectConversation = useCallback(
    async (convId: string) => {
      if (convId === activeId) {
        setShowChat(true);
        return;
      }
      setActiveId(convId);
      setShowChat(true);
      setMessages([]);
      setHasMore(false);
      setError(null);
      setMessagesLoading(true);
      try {
        const { messages: msgs, hasMore: more } = await loadMessages(convId);
        setMessages(msgs);
        setHasMore(more);
        // Mark as read
        fetch(`/api/messages/conversations/${convId}/read`, { method: "PATCH" });
        // Clear unread badge locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? isDoctor
                ? { ...c, doctor_unread_count: 0 }
                : { ...c, user_unread_count: 0 }
              : c
          )
        );
      } catch {
        setError("Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    },
    [activeId, isDoctor, loadMessages]
  );

  // Auto-select initial conversation
  useEffect(() => {
    if (initialConversationId) {
      selectConversation(initialConversationId);
    }
  }, [initialConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!loadingMore) scrollToBottom();
  }, [messages, loadingMore, scrollToBottom]);

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeId) return;

    const channel = supabase
      .channel(`dm:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const newMsg = payload.new as DmMessage;
          setMessages((prev) => {
            // Avoid duplicates (optimistic update may have added it already)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Update conversation preview
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeId
                ? {
                    ...c,
                    last_message_at: newMsg.created_at,
                    last_message_preview: newMsg.content ?? (newMsg.message_type === "image" ? "📷 Image" : "📎 Document"),
                  }
                : c
            )
          );
          // If message from the other party, mark read
          if (newMsg.sender_id !== currentUserId) {
            fetch(`/api/messages/conversations/${activeId}/read`, { method: "PATCH" });
            setTimeout(() => scrollToBottom(true), 50);
          }
        }
      )
      .subscribe();

    // Also subscribe to new conversations appearing
    const convChannel = supabase
      .channel(`dm_conv:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dm_conversations",
          filter: isDoctor
            ? `doctor_id=eq.${currentUserId}`
            : `user_id=eq.${currentUserId}`,
        },
        () => {
          // Refresh conversations list
          fetch("/api/messages/conversations")
            .then((r) => r.json())
            .then((data) => {
              if (data.conversations) setConversations(data.conversations);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(convChannel);
    };
  }, [activeId, currentUserId, isDoctor, supabase, scrollToBottom]);

  // ── Load more (scroll up) ─────────────────────────────────────────────────
  const loadMoreMessages = async () => {
    if (!activeId || !hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldestTimestamp = messages[0].created_at;
      const { messages: older, hasMore: more } = await loadMessages(
        activeId,
        oldestTimestamp
      );
      setMessages((prev) => [...older, ...prev]);
      setHasMore(more);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }
    const isImage = file.type.startsWith("image/");
    const messageType = isImage ? "image" : "document";
    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    setPendingFile({ file, previewUrl, messageType });
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removePendingFile = () => {
    if (pendingFile?.previewUrl) URL.revokeObjectURL(pendingFile.previewUrl);
    setPendingFile(null);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!activeId || sending || uploadingFile) return;
    const trimmedText = text.trim();
    if (!trimmedText && !pendingFile) return;

    setSending(true);
    setError(null);

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;
      let fileType: string | null = null;
      let messageType: "text" | "image" | "document" = "text";

      // Upload file first if present
      if (pendingFile) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append("file", pendingFile.file);
        formData.append("type", "message");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "File upload failed");
        }
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
        fileName = pendingFile.file.name;
        fileSize = pendingFile.file.size;
        fileType = pendingFile.file.type;
        messageType = pendingFile.messageType;
        setUploadingFile(false);
        removePendingFile();
      }

      // Optimistic update
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMsg: DmMessage = {
        id: optimisticId,
        conversation_id: activeId,
        sender_id: currentUserId,
        sender_type: isDoctor ? "doctor" : "user",
        content: trimmedText || null,
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setText("");
      setTimeout(() => scrollToBottom(true), 50);

      // Send to API
      const res = await fetch(`/api/messages/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmedText || null,
          messageType,
          fileUrl,
          fileName,
          fileSize,
          fileType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        // Rollback optimistic
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        throw new Error(err.error || "Failed to send message");
      }

      const { message } = await res.json();
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? message : m))
      );

      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                last_message_at: message.created_at,
                last_message_preview:
                  messageType === "text"
                    ? trimmedText
                    : messageType === "image"
                    ? "📷 Image"
                    : `📎 ${fileName}`,
              }
            : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
      setUploadingFile(false);
      inputRef.current?.focus();
    }
  };

  // Keyboard: Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const activeConv = conversations.find((c) => c.id === activeId);

  // Group messages by date
  const messageGroups: { date: string; messages: DmMessage[] }[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const d = new Date(msg.created_at).toDateString();
    if (d !== lastDate) {
      messageGroups.push({ date: d, messages: [msg] });
      lastDate = d;
    } else {
      messageGroups[messageGroups.length - 1].messages.push(msg);
    }
  }

  return (
    <div
      className="flex overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{
        height: "calc(100vh - 140px)",
        minHeight: 500,
        border: "1px solid var(--primary-light)",
      }}
    >
      {/* ── Sidebar (conversations list) ─────────────────────────────────── */}
      <aside
        className={`flex flex-col border-r ${
          showChat ? "hidden lg:flex" : "flex w-full"
        } lg:w-80 xl:w-96`}
        style={{ borderColor: "var(--primary-light)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 border-b px-5 py-4"
          style={{ borderColor: "var(--primary-light)" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "var(--primary-light)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            className="font-display font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Messages
          </h2>
          <span
            className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
          >
            {conversations.length}
          </span>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "var(--primary-light)" }}
              >
                <User size={20} style={{ color: "var(--primary)" }} />
              </div>
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
              <p className="mt-1 text-xs text-gray-400">
                {isDoctor
                  ? "Patient messages will appear here"
                  : "Book an appointment to start messaging your doctor"}
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const contact = getContactInfo(conv, isDoctor);
              const unread = getUnread(conv, isDoctor);
              const isActive = conv.id === activeId;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className="w-full border-b px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40"
                  style={{
                    borderColor: "var(--primary-light)",
                    background: isActive ? "var(--bg-soft)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar src={contact.avatar} name={contact.name} size={42} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-sm ${unread > 0 ? "font-bold" : "font-semibold"}`}
                          style={{ color: "var(--text-dark)" }}
                        >
                          {contact.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-gray-400">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-gray-400">
                          {conv.last_message_preview || contact.subtitle}
                        </p>
                        {unread > 0 && (
                          <span
                            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                            style={{ background: "var(--primary)" }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      <main
        className={`flex flex-1 flex-col ${
          showChat ? "flex" : "hidden lg:flex"
        }`}
        style={{ background: "var(--bg-soft)" }}
      >
        {activeConv ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-3 border-b bg-white px-4 py-3"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <button
                onClick={() => setShowChat(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <ChevronLeft size={18} />
              </button>
              {(() => {
                const contact = getContactInfo(activeConv, isDoctor);
                return (
                  <>
                    <Avatar src={contact.avatar} name={contact.name} size={38} />
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-400">{contact.subtitle}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop < 80 && hasMore && !loadingMore) loadMoreMessages();
              }}
            >
              {/* Load more */}
              {hasMore && (
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                    className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors hover:bg-blue-50"
                    style={{ border: "1px solid var(--primary-light)", color: "var(--primary)" }}
                  >
                    {loadingMore ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : null}
                    {loadingMore ? "Loading..." : "Load earlier messages"}
                  </button>
                </div>
              )}

              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <div
                    className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No messages yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Send your first message below
                  </p>
                </div>
              ) : (
                messageGroups.map((group, gi) => (
                  <div key={gi}>
                    {messages
                      .filter((m) => new Date(m.created_at).toDateString() === group.date)
                      .map((msg, mi) => (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isMine={msg.sender_id === currentUserId}
                          showDate={mi === 0}
                          dateLabel={formatDate(msg.created_at)}
                        />
                      ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle size={13} />
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Pending file preview */}
            {pendingFile && (
              <div
                className="mx-4 mb-2 flex items-center gap-3 rounded-xl bg-white px-3 py-2.5"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                {pendingFile.messageType === "image" && pendingFile.previewUrl ? (
                  <Image
                    src={pendingFile.previewUrl}
                    alt="preview"
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <FileText size={16} style={{ color: "var(--primary)" }} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-700">
                    {pendingFile.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(pendingFile.file.size)}
                  </p>
                </div>
                <button
                  onClick={removePendingFile}
                  className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Message input */}
            <form
              onSubmit={handleSend}
              className="border-t bg-white px-4 py-3"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <div
                className="flex items-end gap-2 rounded-2xl px-3 py-2"
                style={{ border: "1.5px solid var(--primary-light)", background: "var(--bg-soft)" }}
              >
                {/* File attach */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || uploadingFile}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500 disabled:opacity-40"
                  title="Attach file"
                >
                  <Paperclip size={17} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  onChange={handleFileSelect}
                />

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  disabled={sending || uploadingFile}
                  className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
                  style={{ maxHeight: 120, lineHeight: "1.5" }}
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={(!text.trim() && !pendingFile) || sending || uploadingFile}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-all disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                  }}
                >
                  {sending || uploadingFile ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-gray-400">
                Press Enter to send · Shift+Enter for new line · Max 10MB files
              </p>
            </form>
          </>
        ) : (
          /* Empty state — no conversation selected */
          <div className="hidden flex-col items-center justify-center lg:flex h-full text-center px-8">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "var(--primary-light)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className="font-display text-lg font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              Select a conversation
            </p>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              Choose a conversation from the left panel to start messaging
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
