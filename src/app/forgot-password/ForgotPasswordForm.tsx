"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent to your email");
    } catch {
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-2xl bg-white p-8 text-center"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}
        >
          <CheckCircle2 size={28} style={{ color: "#059669" }} />
        </div>
        <h3
          className="font-display text-xl font-bold"
          style={{ color: "var(--text-dark)" }}
        >
          Check Your Email
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          We've sent a password reset link to{" "}
          <span className="font-semibold" style={{ color: "var(--text-dark)" }}>
            {email}
          </span>
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Didn't receive it? Check your spam folder or try again.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-8"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <div>
        <label
          className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-dark)" }}
        >
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
            <Mail size={15} className="text-gray-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border py-3 pr-4 pl-10 text-sm transition focus:outline-none"
            style={{
              borderColor: "var(--primary-light)",
              color: "var(--text-dark)",
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Sending…
          </>
        ) : (
          "Send Reset Link"
        )}
      </button>
    </form>
  );
}
