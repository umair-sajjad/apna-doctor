export function DoctorCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex gap-4">
        <div className="h-24 w-24 rounded-lg bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 w-2/3 rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded bg-gray-200"></div>
            <div className="h-8 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppointmentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-1/2 rounded bg-gray-200"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-2/3 rounded bg-gray-200"></div>
        </div>
        <div className="h-6 w-20 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
