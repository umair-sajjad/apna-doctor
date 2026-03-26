import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Logo from "@/components/shared/logo";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg-soft)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="md" />
          </div>
          <h2
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 text-center">
          <Link
            href="/login/user"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
