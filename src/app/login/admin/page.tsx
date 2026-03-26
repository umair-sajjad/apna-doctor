import Link from "next/link";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-2xl shadow-green-500/50">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-400">
            Secure access to ApnaDoctor Admin Panel
          </p>
        </div>

        <AdminLoginForm />

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              href="/login/user"
              className="text-gray-400 transition-colors hover:text-white"
            >
              User Login
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/login/doctor"
              className="text-gray-400 transition-colors hover:text-white"
            >
              Doctor Login
            </Link>
          </div>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
