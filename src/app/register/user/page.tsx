// ── register/user/page.tsx ────────────────────────────────────────────────────
// Place at: src/app/register/user/page.tsx

import Link from "next/link";
import UserRegisterForm from "./UserRegisterForm";
import Logo from "@/components/shared/logo";
import { Stethoscope } from "lucide-react";

export default function UserRegisterPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg-soft)" }}
    >
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="md" />
          </div>
          <h2
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-dark)" }}
          >
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign up to book appointments with verified doctors
          </p>
        </div>
        <UserRegisterForm />
        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login/user"
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Login
            </Link>
          </p>
          <p className="text-gray-500">
            Are you a doctor?{" "}
            <Link
              href="/register/doctor"
              className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              <Stethoscope size={12} /> Register as Doctor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
