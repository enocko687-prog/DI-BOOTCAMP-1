import Link from "next/link";
import { ResetPasswordForm } from "../../components/password-reset-forms";

export const metadata = {
  title: "Reset Password | WOFEM",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[70vh] bg-cream px-5 py-16">
      <section className="mx-auto max-w-lg rounded-2xl bg-white p-7 shadow-lg sm:p-10">
        <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">ACCOUNT RECOVERY</p>
        <h1 className="mt-3 text-3xl font-extrabold text-forest">Set a new password</h1>
        <p className="mt-3 leading-7 text-muted">Choose a strong password that you do not use for other accounts.</p>
        <ResetPasswordForm />
        <Link className="mt-5 inline-block text-sm font-semibold text-muted underline" href="/">Return to the WOFEM website</Link>
      </section>
    </main>
  );
}
