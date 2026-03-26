"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signUp } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type Errors = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  terms?: string;
};

const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wide";
const LABEL_STYLE = { color: "var(--text-dark)" };
const INPUT_BASE =
  "w-full rounded-xl border py-3 pr-4 pl-10 text-sm transition focus:outline-none focus:ring-2";
const INPUT_STYLE = {
  borderColor: "var(--primary-light)",
  color: "var(--text-dark)",
};
const INPUT_ERR = { borderColor: "#f87171", color: "var(--text-dark)" };

export default function DoctorRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [termsChecked, setTermsChecked] = useState(false);

  const validate = (f: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Errors => {
    const e: Errors = {};
    if (!f.fullName.trim()) e.fullName = "Full name is required";
    if (!f.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      e.email = "Enter a valid email address";
    if (!f.phone) e.phone = "Phone number is required";
    else if (!/^03[0-9]{2}-[0-9]{7}$/.test(f.phone))
      e.phone = "Format must be 03XX-XXXXXXX";
    if (!f.password) e.password = "Password is required";
    else if (f.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!termsChecked) e.terms = "You must agree to the terms";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fieldErrors = validate({
      fullName: formData.get("fullName") as string,
      email: (formData.get("email") as string).trim(),
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
    });
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await signUp(formData);
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      }
    } catch (error) {
      if (isRedirectError(error)) throw error;
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback?type=doctor`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) {
        toast.error(error.message);
        setGoogleLoading(false);
      }
    } catch {
      toast.error("Failed to register with Google");
      setGoogleLoading(false);
    }
  };

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-white p-8"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <input type="hidden" name="userType" value="doctor" />

      {/* Doctor badge */}
      <div className="mb-5 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(14,165,233,0.1)",
            border: "1px solid rgba(14,165,233,0.2)",
          }}
        >
          <Stethoscope size={28} style={{ color: "var(--accent)" }} />
        </motion.div>
        <p
          className="font-display font-bold"
          style={{ color: "var(--text-dark)" }}
        >
          Register as Doctor
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          Join our network of healthcare professionals
        </p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            Full Name *
          </label>
          <div className="relative">
            <User
              size={15}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
              style={{ color: errors.fullName ? "#f87171" : "#9ca3af" }}
            />
            <input
              type="text"
              name="fullName"
              placeholder="Dr. John Smith"
              onChange={() => clearError("fullName")}
              className={INPUT_BASE}
              style={errors.fullName ? INPUT_ERR : INPUT_STYLE}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Professional Email *
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
                className={INPUT_BASE}
                style={errors.email ? INPUT_ERR : INPUT_STYLE}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label className={LABEL} style={LABEL_STYLE}>
              Phone Number *
            </label>
            <div className="relative">
              <Phone
                size={15}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
                style={{ color: errors.phone ? "#f87171" : "#9ca3af" }}
              />
              <input
                type="tel"
                name="phone"
                placeholder="03XX-XXXXXXX"
                onChange={() => clearError("phone")}
                className={INPUT_BASE}
                style={errors.phone ? INPUT_ERR : INPUT_STYLE}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* PMDC */}
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            PMDC Number (Optional)
          </label>
          <div className="relative">
            <Building2
              size={15}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="pmdcNumber"
              placeholder="XXXXX-X (will be verified)"
              className={`${INPUT_BASE}`}
              style={INPUT_STYLE}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Can be added later during profile completion
          </p>
        </div>

        {/* Gender */}
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            Gender *
          </label>
          <select
            name="gender"
            defaultValue=""
            className="w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none"
            style={INPUT_STYLE}
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            Password *
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
              placeholder="Minimum 6 characters"
              onChange={() => clearError("password")}
              className={`${INPUT_BASE} pr-12`}
              style={errors.password ? INPUT_ERR : INPUT_STYLE}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => {
                setTermsChecked(e.target.checked);
                clearError("terms");
              }}
              className="mt-0.5 rounded border-gray-300"
              style={{ accentColor: "var(--primary)" }}
            />
            <span className="text-sm text-gray-500">
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Creating Account…
            </>
          ) : (
            "Register as Doctor"
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
          onClick={handleGoogleRegister}
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

        {/* Note */}
        <div
          className="rounded-xl p-3 text-xs"
          style={{
            background: "var(--bg-soft)",
            border: "1px solid var(--primary-light)",
            color: "var(--text-dark)",
          }}
        >
          <span className="font-semibold">Note:</span> After registration,
          you'll need to complete your profile and upload verification documents
          (PMDC certificate, degree) for account approval.
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login/doctor"
            className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.form>
  );
}
