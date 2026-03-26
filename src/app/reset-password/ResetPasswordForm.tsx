"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully");
      router.push("/login/user");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const INPUT_BASE =
    "w-full rounded-xl border py-3 pl-10 text-sm transition focus:outline-none";
  const INPUT_STYLE = {
    borderColor: "var(--primary-light)",
    color: "var(--text-dark)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-8"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      {/* New password */}
      <div>
        <label
          className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-dark)" }}
        >
          New Password
        </label>
        <div className="relative">
          <Lock
            size={15}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            className={`${INPUT_BASE} pr-12`}
            style={INPUT_STYLE}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label
          className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-dark)" }}
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock
            size={15}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
          />
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Re-enter password"
            className={`${INPUT_BASE} pr-12`}
            style={{
              ...INPUT_STYLE,
              borderColor:
                confirmPassword && confirmPassword !== password
                  ? "#f87171"
                  : confirmPassword && confirmPassword === password
                    ? "#6ee7b7"
                    : "var(--primary-light)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          {confirmPassword && confirmPassword === password && (
            <CheckCircle2
              size={14}
              className="absolute top-1/2 right-10 -translate-y-1/2"
              style={{ color: "#059669" }}
            />
          )}
        </div>
        {confirmPassword && confirmPassword !== password && (
          <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
        )}
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
            <Loader2 size={15} className="animate-spin" /> Resetting…
          </>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}
