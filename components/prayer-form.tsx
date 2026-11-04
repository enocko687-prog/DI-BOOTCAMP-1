"use client";

import { useState, type FormEvent } from "react";

const categories = [
  "Family",
  "Faith and spiritual growth",
  "Education and work",
  "Thanksgiving",
  "Other",
];

export function PrayerForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function submitPrayerRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSending(true);
    setIsError(false);
    setMessage("Sending your request securely...");

    try {
      const response = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          category: String(formData.get("category") ?? ""),
          message: String(formData.get("message") ?? "").trim(),
          consent: formData.get("consent") === "on",
        }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Your request could not be sent.");
      }

      form.reset();
      setMessage("Your prayer request was saved privately for authorized church staff.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof TypeError
          ? "Could not connect to the church website. Please try again later."
          : error instanceof Error
            ? error.message
            : "Your request could not be sent. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-ink placeholder:text-slate-400";
  const labelClass = "mb-1 block text-sm font-bold text-forest";

  return (
    <form onSubmit={submitPrayerRequest} className="rounded-2xl bg-white p-6 shadow-xl shadow-forest/10 sm:p-8">
      <label className={labelClass} htmlFor="prayerName">Your name (optional)</label>
      <input className={fieldClass} id="prayerName" name="name" maxLength={80} placeholder="Enter your name" />

      <label className={`${labelClass} mt-5`} htmlFor="prayerEmail">Email (optional)</label>
      <input className={fieldClass} id="prayerEmail" name="email" type="email" maxLength={120} placeholder="you@example.com" />

      <label className={`${labelClass} mt-5`} htmlFor="prayerCategory">Prayer category</label>
      <select className={fieldClass} id="prayerCategory" name="category" required defaultValue="">
        <option value="" disabled>Choose a category</option>
        {categories.map((category) => <option key={category}>{category}</option>)}
      </select>

      <label className={`${labelClass} mt-5`} htmlFor="prayerMessage">Prayer request</label>
      <textarea className={fieldClass} id="prayerMessage" name="message" rows={5} maxLength={1000} minLength={5} required placeholder="Write your request here..." />

      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input className="mt-1 accent-forest" name="consent" type="checkbox" required />
        <span>I agree to share this request with authorized WOFEM staff so they can pray for me. My request is not public; I can leave my name and email blank.</span>
      </label>

      <button className="mt-6 w-full rounded-lg bg-forest px-5 py-3 font-bold text-white transition hover:bg-forest-light disabled:cursor-wait disabled:opacity-60 sm:w-auto" type="submit" disabled={isSending}>
        {isSending ? "Sending..." : "Send Prayer Request"}
      </button>
      <p className={`mt-4 min-h-6 text-sm ${isError ? "text-red-700" : "text-forest"}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
