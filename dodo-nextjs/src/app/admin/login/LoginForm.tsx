"use client";

import { useActionState, useState } from "react";
import { signInAdmin, signUpAdmin } from "./actions";

export default function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [signInState, signInAction, isSignInPending] = useActionState(signInAdmin, null);
  const [signUpState, signUpAction, isSignUpPending] = useActionState(signUpAdmin, null);

  const activeError = isRegistering ? signUpState?.error : signInState?.error;
  const isPending = isRegistering ? isSignUpPending : isSignInPending;

  return (
    <div className="w-full max-w-md p-8 bg-[#1E1D1B] border border-[#33322E] rounded-2xl shadow-2xl text-[#F3F2EE]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D97757]/15 border border-[#D97757]/30 text-[#D97757] mb-3 text-xl font-bold">
          ⚡
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Goclaim Admin Console</h1>
        <p className="text-xs text-[#9E9C96] mt-1.5">
          {isRegistering
            ? "Create the designated administrator credentials"
            : "Sign in with Neon Auth to manage boards and social proof"}
        </p>
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
          disabled={isPending}
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
