"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await authClient.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      router.push("/admin/login");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="w-full py-1.5 px-3 text-xs font-medium text-[#9E9C96] hover:text-white bg-[#1E1D1B] hover:bg-[#282724] border border-[#33322E] rounded-lg transition-colors cursor-pointer text-center block"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
