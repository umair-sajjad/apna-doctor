import Link from "next/link";
import DoctorRegisterForm from "./DoctorRegisterForm";
import Logo from "@/components/shared/logo";
import { User } from "lucide-react";

export default function DoctorRegisterPage() {
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
            Register as Doctor
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Join our network of verified healthcare professionals
          </p>
        </div>
        <DoctorRegisterForm />
        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login/doctor"
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Login as Doctor
            </Link>
          </p>
          <p className="text-gray-500">
            Are you a patient?{" "}
            <Link
              href="/register/user"
              className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              <User size={12} /> Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
