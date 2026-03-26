import Link from "next/link";
import DoctorLoginForm from "./DoctorLoginForm";
import Logo from "@/components/shared/logo";
import { User } from "lucide-react";

export default function DoctorLoginPage() {
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
            Doctor Login
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Access your doctor dashboard
          </p>
        </div>

        <DoctorLoginForm />

        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register/doctor"
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Register as Doctor
            </Link>
          </p>
          <p className="text-gray-500">
            Are you a patient?{" "}
            <Link
              href="/login/user"
              className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              <User size={12} /> User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
