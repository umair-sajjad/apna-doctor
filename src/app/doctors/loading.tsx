export default function DoctorsLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      {/* Header skeleton */}
      <div
        className="border-b py-10"
        style={{
          background: "var(--text-dark)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl space-y-2 px-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-white/10" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-6">
          {/* Filter sidebar skeleton */}
          <div className="hidden w-60 shrink-0 lg:block">
            <div
              className="space-y-5 rounded-2xl bg-white p-5"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
                </div>
              ))}
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>

          {/* Results skeleton */}
          <div className="flex-1 space-y-4">
            {/* Toolbar */}
            <div className="mb-5 flex items-center justify-between">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-200" />
            </div>

            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-5"
                style={{ border: "1px solid var(--primary-light)" }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
                      </div>
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-8 w-24 animate-pulse rounded-xl bg-gray-100" />
                      <div className="h-8 w-20 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
