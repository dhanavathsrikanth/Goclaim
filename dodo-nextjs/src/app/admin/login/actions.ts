"use server";

import { getAuth, checkIsAdminInDb } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signInAdmin(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Cross check database table for admin role
  const isAdmin = await checkIsAdminInDb(email);
  if (!isAdmin) {
    return { error: `Access denied. The account (${email}) does not have an admin role in the database.` };
  }

  const { error } = await getAuth().signIn.email({
    email,
    password,
  });

  if (error) {
    return { error: error.message || "Invalid credentials. Please try again." };
  }

  redirect("/admin");
}

export async function signUpAdmin(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || "Admin";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Cross check database table for admin role before allowing signup
  const isAdmin = await checkIsAdminInDb(email);
  if (!isAdmin) {
    return { error: `Sign up restricted. The email (${email}) must be added to the database with admin role first.` };
  }

  const { error } = await getAuth().signUp.email({
    email,
    name,
    password,
  });

  if (error) {
    return { error: error.message || "Failed to create admin account." };
  }

  redirect("/admin");
}

