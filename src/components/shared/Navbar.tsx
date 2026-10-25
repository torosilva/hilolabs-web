"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const NAV_LINKS = [
  { href: "/services", key: "services" },
  { href: "/case-studies", key: "case_studies" },
  { href: "/loyalty", key: "hilo" },
  { href: "/about", key: "about" },
] as const;

export default function Navbar() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-black/5">
      <div className="h-20 flex items-center justify-between px-6">
        {/* Izquierda: Logo */}
        <div className="flex items-center h-full">
          <Link href="/" className="flex items-center group relative h-full py-2" onClick={() => setOpen(false)}>
            <div className="relative w-[142px] h-[45px] flex-shrink-0 group-hover:scale-102 transition-transform duration-300">
              <Image src="/logo-brand-clean-v2.png" alt="Hilo Labs Logo" fill className="object-contain" priority />
            </div>
          </Link>
        </div>

        {/* Enlaces de Navegación */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-gray)]">
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} className="hover:text-[var(--foreground)] transition-colors hilo-line pb-1">
              {t(key)}
            </Link>
          ))}
        </div>

        {/* Extrema Derecha: Botones */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLocale}
            className="text-xs uppercase tracking-widest font-mono text-[var(--color-gray)] hover:text-[var(--foreground)] transition-colors"
          >
            {locale === "en" ? "ES" : "EN"}
          </button>
          <Link
            href="/contact"
            className="hidden sm:inline-block bg-[var(--color-fuchsia)] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all active:scale-95"
          >
            {t("cta")}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={t("menu")}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-black/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="md:hidden border-t border-black/5 bg-white px-6 py-6 flex flex-col gap-5 text-base font-medium">
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="text-[var(--foreground)]">
              {t(key)}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="bg-[var(--color-fuchsia)] text-white px-5 py-3 rounded-full text-center"
          >
            {t("cta")}
          </Link>
        </div>
      )}
    </nav>
  );
}
