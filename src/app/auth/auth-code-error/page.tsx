import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Authentication Error
        </h1>
        <p className="mb-6 text-gray-600">
          Sorry, we couldn't complete your sign-in. Please try again.
        </p>
        <Link
          href="/login/user"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
