import Link from "next/link";
import { ForgotPasswordForm } from "../../components/password-reset-forms";

export const metadata = {
  title: "Password Recovery | WOFEM",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-[70vh] bg-cream px-5 py-16">
      <section className="mx-auto max-w-lg rounded-2xl bg-white p-7 shadow-lg sm:p-10">
        <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">ACCOUNT RECOVERY</p>
        <h1 className="mt-3 text-3xl font-extrabold text-forest">Forgot your password?</h1>
        <p className="mt-3 leading-7 text-muted">Enter your account email. If it is registered, we will send a secure reset link that expires after 30 minutes.</p>
        <ForgotPasswordForm />
        <Link className="mt-5 inline-block text-sm font-semibold text-muted underline" href="/">Return to the WOFEM website</Link>
      </section>
    </main>
  );
}
