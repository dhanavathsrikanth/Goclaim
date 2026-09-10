import { NextRequest, NextResponse } from "next/server";
import { getAuth, checkIsAdminInDb } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { data: session } = await getAuth().getSession();
    const email = session?.user?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.redirect(
        new URL("/admin/login?error=auth_failed", request.url)
      );
    }

    // Check whether user is added in database users table with admin role
    const isAdmin = await checkIsAdminInDb(email);

    if (!isAdmin) {
      // User is authenticated with Google, but NOT an admin in the database.
      // Do NOT redirect to the admin page.
      // Redirect back to login with unauthorized error and email.
      return NextResponse.redirect(
        new URL(
          `/admin/login?error=unauthorized&email=${encodeURIComponent(email)}`,
          request.url
        )
      );
    }

    // Authorized admin -> redirect to admin dashboard
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (err) {
    console.error("Error in admin auth callback:", err);
    return NextResponse.redirect(
      new URL("/admin/login?error=server_error", request.url)
    );
  }
}
