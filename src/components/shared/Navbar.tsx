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
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-[#0E0A14] border-b border-white/5">
      {/* Izquierda: Logo y Nombre */}
      <div className="flex items-center gap-3 relative h-full">
        <Link href="/" className="flex items-center group relative h-full">
          <div className="absolute top-1/2 -translate-y-1/2 -left-6 w-32 h-32 md:w-40 md:h-40 pointer-events-none group-hover:scale-105 transition-transform duration-500">
            <Image src="/logo-clean.png" alt="HiloLabs Logo" fill className="object-cover" />
          </div>
          <span className="font-serif text-3xl tracking-tight hidden md:block ml-24 md:ml-28 text-[var(--color-cream)] relative z-10">HiloLabs</span>
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
