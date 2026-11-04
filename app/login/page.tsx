import Link from "next/link";
import { MemberAuthForm } from "../../components/member-auth-form";

export const metadata = {
  title: "Member Sign In | WOFEM",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-[70vh] bg-cream px-5 py-16">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-7 shadow-lg sm:p-10">
        <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">WOFEM COMMUNITY</p>
        <h1 className="mt-3 text-3xl font-extrabold text-forest">Member sign in</h1>
        <p className="mt-3 leading-7 text-muted">Sign in to your private church community account.</p>
        <MemberAuthForm mode="login" />
        <Link className="mt-6 inline-block text-sm font-semibold text-muted underline" href="/">Return to the WOFEM website</Link>
      </div>
    </main>
  );
}
