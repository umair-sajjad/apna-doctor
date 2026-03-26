export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg-soft)" }}
    >
      {/* Animated logo mark */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div
          className="absolute h-20 w-20 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent)",
            borderRightColor: "var(--accent)",
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute h-14 w-14 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: "var(--primary)",
            borderLeftColor: "var(--primary)",
            animationDirection: "reverse",
            animationDuration: "0.8s",
          }}
        />
        {/* Logo icon center */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
            <rect x="19" y="6" width="6" height="32" rx="3" fill="white" />
            <rect x="6" y="19" width="32" height="6" rx="3" fill="white" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p
          className="font-display text-base font-semibold"
          style={{ color: "var(--text-dark)" }}
        >
          ApnaDoctor
        </p>
        <p className="mt-1 text-xs text-gray-400">Loading, please wait…</p>
      </div>
    </div>
  );
}
