import { createClient } from "@/lib/supabase/server";
import {
  Settings,
  Bell,
  Mail,
  Key,
  Database,
  Globe,
  Shield,
} from "lucide-react";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user?.id || "")
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">
          Manage platform settings and configurations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Settings Menu */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <nav className="space-y-1">
            {[
              { icon: Settings, label: "General", active: true },
              { icon: Bell, label: "Notifications", active: false },
              { icon: Mail, label: "Email Settings", active: false },
              { icon: Key, label: "API Keys", active: false },
              { icon: Database, label: "Database", active: false },
              { icon: Globe, label: "Localization", active: false },
              { icon: Shield, label: "Security", active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                  item.active
                    ? "bg-green-50 font-medium text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Admin Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={admin?.full_name}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={admin?.email}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  defaultValue={admin?.role}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2"
                />
              </div>
              <button className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700">
                Save Changes
              </button>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Platform Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">
                    Temporarily disable the platform
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <div>
                  <p className="font-medium text-gray-900">
                    New User Registrations
                  </p>
                  <p className="text-sm text-gray-600">
                    Allow new users to register
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <div>
                  <p className="font-medium text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Send email notifications to users
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">
                    Send SMS reminders to users
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              API Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Stripe API Key
                </label>
                <input
                  type="password"
                  defaultValue="sk_test_••••••••••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Twilio Account SID
                </label>
                <input
                  type="password"
                  defaultValue="AC••••••••••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Google Maps API Key
                </label>
                <input
                  type="password"
                  defaultValue="AIza••••••••••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm"
                />
              </div>
              <button className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700">
                Update API Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
