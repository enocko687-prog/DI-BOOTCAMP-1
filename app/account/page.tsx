import { MemberAccount } from "../../components/member-account";

export const metadata = {
  title: "Member Account | WOFEM",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="min-h-[70vh] bg-cream px-5 py-16">
      <section className="mx-auto max-w-2xl rounded-2xl bg-white p-7 shadow-lg sm:p-10">
        <p className="text-xs font-extrabold tracking-[0.2em] text-amber-700">WOFEM COMMUNITY</p>
        <h1 className="mt-3 text-3xl font-extrabold text-forest">Your member account</h1>
        <p className="mb-7 mt-3 leading-7 text-muted">Your profile is private and is only used to support your church community account.</p>
        <MemberAccount />
      </section>
    </main>
  );
}
