"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signInAdmin } from "@/app/actions/auth";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { motion } from "framer-motion";

type Errors = { email?: string; password?: string };

export default function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (email: string, password: string): Errors => {
    const e: Errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    const fieldErrors = validate(email, password);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setErrors({});
    setLoading(true);

    try {
      const result = await signInAdmin(formData);
      if (result?.error) { toast.error(result.error); setLoading(false); }
    } catch {
      // redirect handled by Next.js
    }
  };

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-xl"
    >
      <input type="hidden" name="userType" value="admin" />

      {/* Security Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
        <div>
          <p className="text-sm font-medium text-yellow-200">Secure Admin Access</p>
          <p className="mt-1 text-xs text-yellow-300/70">This area is restricted. All access attempts are logged.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Admin Email</label>
          <div className="relative">
            <Mail className={`absolute top-3 left-3 h-5 w-5 ${errors.email ? "text-red-400" : "text-gray-500"}`} />
            <input
              type="email"
              name="email"
              placeholder="admin@apnadoctor.com"
              onChange={() => clearError("email")}
              className={`w-full rounded-lg border bg-gray-900/50 py-3 pr-4 pl-10 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-400" : "border-gray-600 focus:border-transparent focus:ring-green-500"}`}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <Lock className={`absolute top-3 left-3 h-5 w-5 ${errors.password ? "text-red-400" : "text-gray-500"}`} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter admin password"
              onChange={() => clearError("password")}
              className={`w-full rounded-lg border bg-gray-900/50 py-3 pr-12 pl-10 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-600 focus:border-transparent focus:ring-green-500"}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 text-gray-500 transition-colors hover:text-gray-300">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="group flex cursor-pointer items-center text-gray-400">
            <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-900 text-green-500 focus:ring-green-500" />
            <span className="transition-colors group-hover:text-gray-300">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-green-400 transition-colors hover:text-green-300">Forgot password?</a>
        </div>

        {/* Submit */}
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white shadow-lg shadow-green-500/30 transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:shadow-none">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </span>
          ) : "Access Admin Panel"}
        </motion.button>
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6 text-center">
        <p className="text-xs text-gray-500">Protected by enterprise-grade security</p>
        <p className="mt-1 text-xs text-gray-600">IP: <span className="font-mono">xxx.xxx.xxx.xxx</span> • Session encrypted</p>
      </div>
    </motion.form>
  );
}
