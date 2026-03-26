"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, Stethoscope, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Errors = { email?: string; password?: string };

export default function DoctorLoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (email: string, password: string): Errors => {
    const e: Errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;
    const fieldErrors = validate(email, password);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await signIn(formData);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      }
    } catch {
      /* redirect handled by Next.js */
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback?type=doctor` },
      });
      if (error) {
        toast.error(error.message);
        setGoogleLoading(false);
      }
    } catch {
      toast.error("Failed to login with Google");
      setGoogleLoading(false);
    }
  };

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border py-3 pr-4 pl-10 text-sm transition focus:outline-none ${
      hasError
        ? "border-red-400 focus:ring-2 focus:ring-red-200"
        : "focus:ring-2"
    }`;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl bg-white p-8"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <input type="hidden" name="userType" value="doctor" />

      {/* Doctor badge */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(14,165,233,0.1)",
            border: "1px solid rgba(14,165,233,0.2)",
          }}
        >
          <Stethoscope size={28} style={{ color: "var(--accent)" }} />
        </motion.div>
      </div>

      <div className="text-center">
        <p
          className="font-display text-base font-bold"
          style={{ color: "var(--text-dark)" }}
        >
          Doctor Portal
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          Sign in to manage your appointments
        </p>
      </div>

      {/* Email */}
      <div>
        <label
          className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-dark)" }}
        >
          Email Address
        </label>
        <div className="relative">
          <Mail
            size={15}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            style={{ color: errors.email ? "#f87171" : "#9ca3af" }}
          />
          <input
            type="email"
            name="email"
            placeholder="doctor@hospital.com"
            onChange={() => clearError("email")}
            className={inputClass(!!errors.email)}
            style={
              errors.email
                ? { color: "var(--text-dark)" }
                : {
                    borderColor: "var(--primary-light)",
                    color: "var(--text-dark)",
                  }
            }
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          className="mb-1.5 block text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-dark)" }}
        >
          Password
        </label>
        <div className="relative">
          <Lock
            size={15}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            style={{ color: errors.password ? "#f87171" : "#9ca3af" }}
          />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            onChange={() => clearError("password")}
            className={`${inputClass(!!errors.password)} pr-12`}
            style={
              errors.password
                ? { color: "var(--text-dark)" }
                : {
                    borderColor: "var(--primary-light)",
                    color: "var(--text-dark)",
                  }
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Remember + forgot */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-500">
          <input type="checkbox" className="rounded border-gray-300" />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Signing in…
          </>
        ) : (
          "Sign In as Doctor"
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div
          className="flex-1 border-t"
          style={{ borderColor: "var(--primary-light)" }}
        />
        <span className="text-xs text-gray-400">or</span>
        <div
          className="flex-1 border-t"
          style={{ borderColor: "var(--primary-light)" }}
        />
      </div>

      {/* Google */}
      <motion.button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-3 rounded-xl border py-3 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-50"
        style={{
          borderColor: "var(--primary-light)",
          color: "var(--text-dark)",
        }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {googleLoading ? "Connecting…" : "Continue with Google"}
      </motion.button>

      {/* Pro tip */}
      <div
        className="rounded-xl p-3 text-xs"
        style={{
          background: "var(--bg-soft)",
          border: "1px solid var(--primary-light)",
          color: "var(--text-dark)",
        }}
      >
        <span className="font-semibold">For Healthcare Professionals:</span> Use
        your professional email address for verification purposes.
      </div>
    </motion.form>
  );
}
