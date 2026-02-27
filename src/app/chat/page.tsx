import { createClient } from "@/lib/supabase/server";
import ChatInterface from "./ChatInterface";

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-blue-600">
              ApnaDoctor
            </a>
            <nav className="flex gap-4">
              {user && (
                <>
                  <a href="/dashboard" className="text-gray-600">
                    Dashboard
                  </a>
                  <a href="/doctors" className="text-gray-600">
                    Find Doctors
                  </a>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <ChatInterface userId={user?.id} />
    </div>
  );
}
