import { getAdminSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#181716] flex items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
