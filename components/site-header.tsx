"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppSelector } from "../app/state/hooks";

const links = [
  ["About", "/#about"],
  ["Gallery", "/#gallery"],
  ["Ministries", "/#ministries"],
  ["Events", "/#events"],
  ["Resources", "/resources"],
  ["Contact", "/#contact"],
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const member = useAppSelector((state) => state.auth.member);

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-forest" aria-label="WOFEM home">
          <img className="h-12 w-12 rounded-full object-contain" src="/assets/wofem-logo.png" alt="WOFEM church logo" />
          <span>
            <strong className="block text-lg tracking-[0.18em]">WOFEM</strong>
            <small className="block text-[10px] leading-tight text-muted">World of Faith Evangelistic<br />Ministries International</small>
          </span>
        </Link>

        <button
          type="button"
          className="rounded-lg border border-forest/15 px-3 py-2 text-xl text-forest xl:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <nav
          aria-label="Main navigation"
          className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b bg-white p-5 shadow-lg xl:static xl:flex xl:flex-row xl:items-center xl:gap-3 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none`}
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}             className="whitespace-nowrap rounded px-2 py-2 text-sm font-bold text-forest hover:text-amber-700">
              {label}
            </a>
          ))}
          <a href="/#prayer" onClick={() => setMenuOpen(false)} className="mt-1 whitespace-nowrap rounded bg-forest px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-forest-light xl:mt-0">
            Prayer Request
          </a>
          {member ? (
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="whitespace-nowrap rounded border border-forest/20 px-3 py-2.5 text-center text-sm font-bold text-forest hover:bg-cream"
            >
              My account
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="whitespace-nowrap rounded border border-forest/20 px-3 py-2.5 text-center text-sm font-bold text-forest hover:bg-cream"
              >
                Create account
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="whitespace-nowrap rounded border border-forest/20 px-3 py-2.5 text-center text-sm font-bold text-forest hover:bg-cream"
              >
                Log in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
