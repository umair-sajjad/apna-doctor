export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-soft)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header skeleton */}
        <div
          className="mb-8 overflow-hidden rounded-2xl px-8 py-8"
          style={{ background: "var(--text-dark)" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
              <div className="h-3 w-64 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6"
              style={{ border: "1px solid var(--primary-light)" }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                  <div className="h-10 w-14 animate-pulse rounded-lg bg-gray-100" />
                </div>
                <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Appointments skeleton */}
          <div
            className="col-span-1 rounded-2xl bg-white lg:col-span-2"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
            <div
              className="divide-y px-6"
              style={{ borderColor: "var(--primary-light)" }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-36 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden h-6 w-20 animate-pulse rounded-full bg-gray-100 sm:block" />
                    <div className="h-8 w-14 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions skeleton */}
          <div
            className="rounded-2xl bg-white"
            style={{ border: "1px solid var(--primary-light)" }}
          >
            <div
              className="border-b px-6 py-4"
              style={{ borderColor: "var(--primary-light)" }}
            >
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                    <div className="h-2.5 w-32 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
