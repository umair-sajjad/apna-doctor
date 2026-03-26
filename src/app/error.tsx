"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, Mail, HelpCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg-soft)" }}
    >
      {/* Card */}
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-center"
        style={{ border: "1px solid var(--primary-light)" }}
      >
        {/* Dark top banner */}
        <div
          className="relative overflow-hidden px-8 py-10"
          style={{ background: "var(--text-dark)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="pointer-events-none absolute top-0 right-0 h-full w-1/2 opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at right, #ef4444, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p
              className="font-display text-6xl font-bold opacity-20"
              style={{ color: "#ef4444" }}
            >
              500
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-white">
              Something Went Wrong
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Something unexpected happened. Our team has been notified.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {process.env.NODE_ENV === "development" && (
            <div
              className="mb-6 rounded-xl p-4 text-left"
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--primary-light)",
              }}
            >
              <p className="font-mono text-xs break-all text-red-500">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-400">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-gray-50"
              style={{
                borderColor: "var(--primary-light)",
                color: "var(--text-dark)",
              }}
            >
              <Home size={15} />
              Back to Home
            </Link>
          </div>

          {/* Support */}
          <div
            className="mt-6 rounded-xl p-4"
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--primary-light)",
            }}
          >
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--text-dark)" }}
            >
              Still having issues?
            </p>
            <div className="mt-2 flex items-center justify-center gap-4">
              <a
                href="mailto:support@apnadoctor.pk"
                className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                <Mail size={12} /> Email Support
              </a>
              <span className="text-gray-300">|</span>
              <Link
                href="/help"
                className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--primary)" }}
              >
                <HelpCircle size={12} /> Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
