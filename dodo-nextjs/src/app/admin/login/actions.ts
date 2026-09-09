"use server";

import { auth } from "@/lib/auth/server";
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

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && email !== adminEmail) {
    return { error: "Access denied. Only registered admin email is allowed." };
  }

  const { error } = await auth.signIn.email({
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

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && email !== adminEmail) {
    return { error: `Sign up is restricted to the admin email: ${adminEmail}` };
  }

  const { error } = await auth.signUp.email({
    email,
    name,
    password,
  });

  if (error) {
    return { error: error.message || "Failed to create admin account." };
  }

  redirect("/admin");
}
