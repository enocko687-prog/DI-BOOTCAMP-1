"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { setMember, type Member } from "../app/state/auth-slice";
import { useAppDispatch } from "../app/state/hooks";

export function MemberAuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const consentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("error");
    const messages: Record<string, string> = {
      consent: "Please accept the privacy notice before creating an account.",
      google: "Google sign-in did not complete. Please try again.",
      "google-email": "Google sign-in requires a verified email address.",
      "google-linked": "This email is linked to a different Google account. Contact the church for help.",
      "google-unavailable": "Google sign-in is not configured yet. Use email and password instead.",
    };
    if (code && messages[code]) {
      setError(messages[code]);
    }
    if (query.get("reset") === "success") {
      setNotice("Your password was reset. Sign in with your new password.");
    }
  }, []);

  function startGoogleSignIn() {
    const consent = isRegister && consentRef.current?.checked === true;
    if (isRegister && !consent) {
      setError("Please accept the privacy notice before creating an account.");
      return;
    }

    const form = document.createElement("form");
    form.method = "post";
    form.action = "/auth/google/start";
    const consentInput = document.createElement("input");
    consentInput.type = "hidden";
    consentInput.name = "consent";
    consentInput.value = String(consent);
    form.append(consentInput);
    document.body.append(form);
    form.submit();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/members/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isRegister ? { name: String(formData.get("name") ?? "").trim() } : {}),
          ...(isRegister ? { consent: formData.get("consent") === "on" } : {}),
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = (await response.json()) as { member?: Member; error?: string };
      if (!response.ok || !result.member) {
        throw new Error(result.error || "Your account request could not be completed.");
      }

      dispatch(setMember(result.member));
      router.replace("/account");
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Could not connect to WOFEM. Please try again."
          : submitError instanceof Error
            ? submitError.message
            : "Your account request could not be completed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const labelClass = "mb-1 block text-sm font-bold text-forest";
  const inputClass = "w-full rounded-lg border border-slate-300 px-4 py-3 text-ink";

  return (
    <form className="mt-7 space-y-5" onSubmit={submit}>
      {isRegister && (
        <div>
          <label className={labelClass} htmlFor="memberName">Full name</label>
          <input className={inputClass} id="memberName" name="name" autoComplete="name" minLength={2} maxLength={80} required />
        </div>
      )}
      <div>
        <label className={labelClass} htmlFor="memberEmail">Email address</label>
        <input className={inputClass} id="memberEmail" name="email" type="email" autoComplete="email" maxLength={120} required />
      </div>
      <div>
        <label className={labelClass} htmlFor="memberPassword">Password</label>
        <input className={inputClass} id="memberPassword" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 12 : undefined} maxLength={72} required />
        {isRegister && <p className="mt-2 text-xs leading-5 text-muted">Use 12–72 characters. Your password is stored as a one-way hash.</p>}
      </div>
      {isRegister && (
        <label className="flex items-start gap-3 text-sm leading-6 text-muted">
          <input ref={consentRef} className="mt-1 accent-forest" name="consent" type="checkbox" required />
          <span>I agree to WOFEM storing my name and email for a private community account. This information is not displayed publicly.</span>
        </label>
      )}
      {notice && <p className="text-sm text-forest" role="status">{notice}</p>}
      <p className="min-h-6 text-sm text-red-700" role="alert">{error}</p>
      <button className="w-full rounded-lg bg-forest px-5 py-3 font-bold text-white transition hover:bg-forest-light disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <button className="w-full rounded-lg border border-slate-300 px-5 py-3 font-bold text-forest transition hover:bg-cream" type="button" onClick={startGoogleSignIn}>
        Continue with Google
      </button>
      <p className="text-center text-sm text-muted">
        {isRegister ? "Already have an account?" : "New to WOFEM?"}{" "}
        <Link className="font-bold text-forest underline" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
      {!isRegister && <p className="-mt-3 text-center text-sm"><Link className="font-semibold text-forest underline" href="/forgot-password">Forgot password?</Link></p>}
      {isRegister && (
        <p className="text-xs leading-5 text-muted">
          Do not use this account for urgent requests. To ask about account data or deletion, contact the church.
        </p>
      )}
    </form>
  );
}
