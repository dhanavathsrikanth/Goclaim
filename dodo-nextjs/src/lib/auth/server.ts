import { createNeonAuth } from "@neondatabase/auth/next/server";
import { neon } from "@neondatabase/serverless";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

const sql = neon(process.env.DATABASE_URL!);

/**
 * Checks whether the given email has the 'admin' role in the database users table.
 * Cross-checks with user added in DB with email, password, and role.
 */
export async function checkIsAdminInDb(email: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Query users table for matching email and check role
    const rows = await sql`
      SELECT role FROM users
      WHERE lower(email) = ${cleanEmail}
      LIMIT 1
    `;

    if (rows.length > 0) {
      const role = String((rows[0] as Record<string, unknown>).role ?? "").trim().toLowerCase();
      return role === "admin";
    }

    // 2. Fallback check for admin_users table if user created it under that name
    try {
      const adminRows = await sql`
        SELECT role FROM admin_users
        WHERE lower(email) = ${cleanEmail}
        LIMIT 1
      `;
      if (adminRows.length > 0) {
        const role = String((adminRows[0] as Record<string, unknown>).role ?? "").trim().toLowerCase();
        return role === "admin";
      }
    } catch {
      // admin_users table may not exist
    }

    // 3. Fallback check for ADMIN_EMAIL from env if set and users table is empty
    const adminEnv = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEnv && cleanEmail === adminEnv) {
      const totalUsers = await sql`SELECT count(*)::int as count FROM users`;
      const count = Number((totalUsers[0] as Record<string, unknown>).count ?? 0);
      if (count === 0) {
        // Bootstrap: insert the initial env admin so the table has an admin record
        await sql`
          INSERT INTO users (email, role)
          VALUES (${cleanEmail}, 'admin')
          ON CONFLICT (email) DO NOTHING
        `;
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("Error verifying admin role in database:", err);
    return false;
  }
}

export async function getAdminSession() {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user?.email) return null;

    const email = session.user.email.trim().toLowerCase();
    const isAdmin = await checkIsAdminInDb(email);
    if (!isAdmin) {
      return null;
    }

    return session;
  } catch (err) {
    console.error("Error retrieving admin session:", err);
    return null;
  }
}

