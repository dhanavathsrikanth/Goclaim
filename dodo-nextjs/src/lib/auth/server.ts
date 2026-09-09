import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export async function getAdminSession() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) return null;

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail && session.user.email?.toLowerCase() !== adminEmail) {
      return null;
    }
    return session;
  } catch (err) {
    console.error("Error retrieving admin session:", err);
    return null;
  }
}
