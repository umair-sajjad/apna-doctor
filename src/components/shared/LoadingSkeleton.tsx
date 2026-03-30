export function DoctorCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl bg-white p-6"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <div className="flex gap-4">
        <div
          className="h-24 w-24 shrink-0 rounded-2xl"
          style={{ background: "var(--primary-light)" }}
        />
        <div className="flex-1 space-y-3">
          <div
            className="h-5 w-2/3 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3.5 w-1/3 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3.5 w-3/4 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div className="flex gap-2 pt-1">
            <div
              className="h-8 w-24 rounded-xl"
              style={{ background: "var(--primary-light)" }}
            />
            <div
              className="h-8 w-24 rounded-xl"
              style={{ background: "var(--primary-light)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl bg-white p-5"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2.5">
          <div
            className="h-4 w-1/2 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3.5 w-1/3 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3.5 w-2/3 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
        </div>
        <div
          className="h-6 w-20 rounded-full"
          style={{ background: "var(--primary-light)" }}
        />
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl bg-white p-6"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <div
        className="absolute top-0 right-0 left-0 h-0.5 rounded-t-2xl"
        style={{ background: "var(--primary-light)" }}
      />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div
            className="h-3 w-24 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-8 w-20 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3 w-16 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
        </div>
        <div
          className="h-10 w-10 rounded-xl"
          style={{ background: "var(--primary-light)" }}
        />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl bg-white p-5"
      style={{ border: "1px solid var(--primary-light)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 shrink-0 rounded-full"
          style={{ background: "var(--primary-light)" }}
        />
        <div className="flex-1 space-y-2">
          <div
            className="h-4 w-1/3 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3 w-1/2 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
          <div
            className="h-3 w-3/4 rounded-lg"
            style={{ background: "var(--primary-light)" }}
          />
        </div>
        <div
          className="h-4 w-16 rounded-lg"
          style={{ background: "var(--primary-light)" }}
        />
      </div>
    </div>
  );
}
