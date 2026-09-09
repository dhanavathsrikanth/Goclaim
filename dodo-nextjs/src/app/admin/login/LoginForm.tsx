"use client";

import { useActionState, useState, useEffect } from "react";
import { signInAdmin, signUpAdmin } from "./actions";
import { authClient } from "@/lib/auth/client";

type LoginFormProps = {
  initialError?: string;
  attemptedEmail?: string;
};

export default function LoginForm({ initialError, attemptedEmail }: LoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [signInState, signInAction, isSignInPending] = useActionState(signInAdmin, null);
  const [signUpState, signUpAction, isSignUpPending] = useActionState(signUpAdmin, null);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // If redirected with unauthorized error, ensure client signs out of any unprivileged Google session
  useEffect(() => {
    if (initialError === "unauthorized") {
      authClient.signOut().catch(() => {});
    }
  }, [initialError]);

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true);
    setGoogleError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin/login/callback",
      });
    } catch (err: unknown) {
      console.error("Google sign in failed:", err);
      setGoogleError(
        err instanceof Error ? err.message : "Failed to initiate Google sign in."
      );
      setIsGooglePending(false);
    }
  };

  const activeError = googleError || (isRegistering ? signUpState?.error : signInState?.error);
  const isPending = isRegistering ? isSignUpPending : isSignInPending;

  return (
    <div className="w-full max-w-md p-8 bg-[#1E1D1B] border border-[#33322E] rounded-2xl shadow-2xl text-[#F3F2EE]">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D97757]/15 border border-[#D97757]/30 text-[#D97757] mb-3 text-xl font-bold">
          ⚡
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Goclaim Admin Console</h1>
        <p className="text-xs text-[#9E9C96] mt-1.5">
          {isRegistering
            ? "Create the designated administrator credentials"
            : "Sign in with Google or credentials to access the admin console"}
        </p>
      </div>

      {initialError === "unauthorized" && (
        <div className="p-3.5 mb-5 text-xs bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl leading-relaxed">
          <div className="font-semibold text-red-200 mb-1 flex items-center gap-1.5">
            <span>🚫</span> Access Denied
          </div>
          {attemptedEmail ? (
            <>
              Google account <strong className="text-white underline">{attemptedEmail}</strong> is not registered as an administrator in the database. Only users added in the database with the <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">admin</code> role can access this panel.
            </>
          ) : (
            "Your account is not registered with an admin role in the database. Access to the admin panel is restricted."
          )}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGooglePending || isPending}
        className="w-full py-2.5 px-4 bg-[#262522] hover:bg-[#2F2E2A] border border-[#3E3C38] text-white font-medium rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isGooglePending ? "Connecting with Google..." : "Continue with Google"}</span>
      </button>

      <div className="relative my-5 flex items-center justify-center">
        <div className="border-t border-[#33322E] w-full" />
        <span className="bg-[#1E1D1B] px-3 text-[11px] font-semibold text-[#807D77] uppercase tracking-wider shrink-0">
          or with email
        </span>
        <div className="border-t border-[#33322E] w-full" />
      </div>

      <form action={isRegistering ? signUpAction : signInAction} className="space-y-4">
        {isRegistering && (
          <div>
            <label className="block text-xs font-semibold text-[#9E9C96] uppercase tracking-wider mb-1.5">
              Admin Name
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Administrator"
              className="w-full px-3.5 py-2.5 bg-[#181716] border border-[#33322E] rounded-xl text-white placeholder-[#6B6964] focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#9E9C96] uppercase tracking-wider mb-1.5">
            Admin Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="admin@goclaim.space"
            className="w-full px-3.5 py-2.5 bg-[#181716] border border-[#33322E] rounded-xl text-white placeholder-[#6B6964] focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#9E9C96] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-[#181716] border border-[#33322E] rounded-xl text-white placeholder-[#6B6964] focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] text-sm"
          />
        </div>

        {activeError && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl">
            {activeError}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isGooglePending}
          className="w-full py-2.5 px-4 bg-[#D97757] hover:bg-[#C15F3D] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer mt-2"
        >
          {isPending
            ? isRegistering
              ? "Creating administrator..."
              : "Authenticating..."
            : isRegistering
            ? "Create Admin Account"
            : "Sign In as Administrator"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#33322E] text-center">
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-xs text-[#9E9C96] hover:text-[#D97757] transition-colors cursor-pointer"
        >
          {isRegistering
            ? "Already have an account? Sign in"
            : "First-time deployment? Create admin account"}
        </button>
      </div>
    </div>
  );
}
