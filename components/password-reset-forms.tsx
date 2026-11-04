"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(event.currentTarget);
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(formData.get("email") ?? "").trim() }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not request a password reset.");
      setMessage(result.message || "If an account exists for that email, reset instructions will be sent.");
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Could not connect to WOFEM. Please try again."
          : submitError instanceof Error
            ? submitError.message
            : "Could not request a password reset."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={submit}>
      <div>
        <label className="mb-1 block text-sm font-bold text-forest" htmlFor="resetEmail">Email address</label>
        <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-ink" id="resetEmail" name="email" type="email" autoComplete="email" maxLength={120} required />
      </div>
      {message && <p className="text-sm text-forest" role="status">{message}</p>}
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button className="w-full rounded-lg bg-forest px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>
      <p className="text-center text-sm text-muted"><Link className="font-bold text-forest underline" href="/login">Back to sign in</Link></p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmPassword") ?? "");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/members/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not reset your password.");
      router.replace("/login?reset=success");
    } catch (submitError) {
      setError(
        submitError instanceof TypeError
          ? "Could not connect to WOFEM. Please try again."
          : submitError instanceof Error
            ? submitError.message
            : "Could not reset your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={submit}>
      {!token && <p className="text-sm text-red-700" role="alert">This reset link is missing or invalid. Request a new one below.</p>}
      <div>
        <label className="mb-1 block text-sm font-bold text-forest" htmlFor="newPassword">New password</label>
        <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-ink" id="newPassword" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required />
        <p className="mt-2 text-xs text-muted">Use 12–72 characters.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold text-forest" htmlFor="confirmPassword">Confirm password</label>
        <input className="w-full rounded-lg border border-slate-300 px-4 py-3 text-ink" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={72} required />
      </div>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button className="w-full rounded-lg bg-forest px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={isSubmitting || !token}>
        {isSubmitting ? "Saving..." : "Reset password"}
      </button>
      <p className="text-center text-sm text-muted"><Link className="font-bold text-forest underline" href="/forgot-password">Request another reset link</Link></p>
    </form>
  );
}
