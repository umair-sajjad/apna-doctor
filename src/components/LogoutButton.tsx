"use client";

import { signOut } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
      >
        <LogOut size={14} /> Logout
      </button>
    </form>
  );
}
