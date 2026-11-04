import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#10251f] px-5 py-12 text-center text-white">
      <Link href="/" className="text-xl font-extrabold tracking-[0.2em] text-gold">WOFEM</Link>
      <p className="mt-2 text-sm text-white/80">World of Faith Evangelistic Ministries International</p>
      <p className="text-sm text-white/70">Runda / Githogoro, Nairobi, Kenya</p>
      <nav className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/80" aria-label="Footer navigation">
        <a href="/#about" className="hover:text-gold">About</a>
        <a href="/#gallery" className="hover:text-gold">Gallery</a>
        <a href="/#ministries" className="hover:text-gold">Ministries</a>
        <a href="/#events" className="hover:text-gold">Events</a>
        <a href="/resources" className="hover:text-gold">Resources</a>
        <a href="/#prayer" className="hover:text-gold">Prayer</a>
        <a href="/#contact" className="hover:text-gold">Contact</a>
        <a href="/admin.html" className="hover:text-gold">Staff login</a>
      </nav>
      <p className="mx-auto mt-6 max-w-xl text-xs leading-5 text-white/55">Website activity is counted in anonymous daily totals. The site does not store visitor identities or page URLs for analytics.</p>
      <p className="mt-8 text-xs text-white/60">© {new Date().getFullYear()} WOFEM. All rights reserved.</p>
    </footer>
  );
}
