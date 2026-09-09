import { getAdminSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string; email?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getAdminSession();
  if (session?.user && !params?.error) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#181716] flex items-center justify-center px-4 py-12">
      <LoginForm initialError={params?.error} attemptedEmail={params?.email} />
    </div>
  );
}
