"use client";

import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export default function Navbar() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-white/85 backdrop-blur-md border-b border-black/5">
      {/* Izquierda: Logo */}
      <div className="flex items-center h-full">
        <Link href="/" className="flex items-center group relative h-full py-2">
          <div className="relative w-[142px] h-[45px] flex-shrink-0 group-hover:scale-102 transition-transform duration-300">
            <Image src="/logo-brand-clean.png" alt="Hilo Labs Logo" fill className="object-contain" priority />
          </div>
        </Link>
      </div>

      {/* Enlaces de Navegación */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-gray)]">
        <Link href="/loyalty" className="hover:text-[var(--foreground)] transition-colors hilo-line pb-1">
          {t("loyalty")}
        </Link>
        <Link href="/ai" className="hover:text-[var(--foreground)] transition-colors hilo-line pb-1">
          {t("ai")}
        </Link>
        <Link href="/case-studies" className="hover:text-[var(--foreground)] transition-colors hilo-line pb-1">
          {t("case_studies")}
        </Link>
        <Link href="/pricing" className="hover:text-[var(--foreground)] transition-colors hilo-line pb-1">
          {t("pricing")}
        </Link>
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
          href="/book-demo"
          className="bg-[var(--color-fuchsia)] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all active:scale-95"
        >
          {t("loyalty")}
        </Link>
      </div>
    </nav>
  );
}
