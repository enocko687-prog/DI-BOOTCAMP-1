"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAnonymous } from "../app/state/auth-slice";
import { useAppDispatch, useAppSelector } from "../app/state/hooks";

export function MemberAccount() {
  const member = useAppSelector((state) => state.auth.member);
  const status = useAppSelector((state) => state.auth.status);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setError("");
    setIsSigningOut(true);
    try {
      const response = await fetch("/api/members/logout", { method: "POST" });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Could not sign out.");
      }
      dispatch(setAnonymous());
      router.replace("/");
    } catch (signOutError) {
      setError(
        signOutError instanceof TypeError
          ? "Could not connect to WOFEM. Please try again."
          : signOutError instanceof Error
            ? signOutError.message
            : "Could not sign out."
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  if (status === "checking") {
    return <p className="text-muted" role="status">Checking your account...</p>;
  }

  if (!member) {
    return (
      <div>
        <p className="leading-7 text-muted">Sign in or create an account to see your WOFEM community profile.</p>
        {status === "error" && <p className="mt-3 text-sm text-red-700" role="alert">We could not check your session. Please try again.</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-lg bg-forest px-5 py-3 font-bold text-white" href="/login">Sign in</Link>
          <Link className="rounded-lg border border-forest px-5 py-3 font-bold text-forest" href="/register">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="leading-7 text-muted">Welcome to the WOFEM community, <strong className="text-forest">{member.name}</strong>.</p>
      <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200">
        <div className="grid gap-1 p-4 sm:grid-cols-[120px_1fr]">
          <dt className="text-sm font-bold text-forest">Name</dt>
          <dd className="text-sm text-muted">{member.name}</dd>
        </div>
        <div className="grid gap-1 p-4 sm:grid-cols-[120px_1fr]">
          <dt className="text-sm font-bold text-forest">Email</dt>
          <dd className="text-sm text-muted">{member.email}</dd>
        </div>
      </dl>
      <div className="mt-6 rounded-xl bg-cream p-5">
        <h2 className="font-bold text-forest">Stay connected</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Find service details, church events, Bible teaching, and sermons in the WOFEM resource library.</p>
        <Link className="mt-3 inline-block font-bold text-forest underline" href="/#events">View services and events →</Link>
        <Link className="ml-4 mt-3 inline-block font-bold text-forest underline" href="/resources">Browse resources →</Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      <button className="mt-6 rounded-lg border border-forest px-5 py-3 font-bold text-forest hover:bg-cream disabled:opacity-60" type="button" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
