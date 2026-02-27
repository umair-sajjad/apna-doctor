"use client";

import { signOut } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      Logout
    </button>
  );
}
