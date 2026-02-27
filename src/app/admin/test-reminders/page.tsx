"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function TestRemindersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCron = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/cron/send-reminders", {
        method: "GET",
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(`✅ Reminders processed! 
          2-hour: ${data.summary.twoHourRemindersSent}
          At-time: ${data.summary.atTimeRemindersSent}`);
      } else {
        toast.error("❌ Failed: " + data.error);
      }
    } catch (error) {
      toast.error("Error: " + error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">
            Test Reminder System
          </h1>
          <p className="mt-2 text-gray-600">
            Click the button to manually trigger reminder checks
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <button
            onClick={testCron}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "⏳ Checking for reminders..."
              : "🔔 Run Reminder Check Now"}
          </button>

          {result && (
            <div className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-black">
                {result.success ? "✅ Results:" : "❌ Error:"}
              </h2>

              {result.success && (
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {result.summary.twoHourRemindersSent}
                    </p>
                    <p className="text-sm text-gray-600">2-Hour Reminders</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {result.summary.atTimeRemindersSent}
                    </p>
                    <p className="text-sm text-gray-600">At-Time Reminders</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {result.summary.errors}
                    </p>
                    <p className="text-sm text-gray-600">Errors</p>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-4">
                <pre className="max-h-96 overflow-auto text-sm text-black">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>💡 How to test:</strong>
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-yellow-800">
            <li>Create an appointment for 2 hours from now</li>
            <li>Click "Run Reminder Check Now"</li>
            <li>Check your email/SMS for the reminder</li>
            <li>Reminders are only sent once per appointment</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
