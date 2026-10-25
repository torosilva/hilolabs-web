"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Service } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("Navigation");
  const tf = useTranslations("Footer");
  const ts = useTranslations("Services");
  const services = ts.raw("items") as Service[];

  return (
    <footer className="bg-[var(--color-section-bg)] border-t border-black/5 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex justify-start mb-6">
            <div className="relative w-[189px] h-[60px] flex-shrink-0 opacity-80 hover:opacity-100 transition-all duration-300">
              <Image src="/logo-brand-clean-v2.png" alt="Hilo Labs Logo" fill className="object-contain" />
            </div>
          </div>
          <p className="text-[var(--color-gray)] text-sm leading-relaxed mb-6">
            {tf("tagline")}
          </p>
          <div className="flex flex-col gap-2 text-xs text-[var(--color-gray)]/60 font-mono">
            <span className="font-semibold text-[var(--foreground)]">HiloLabs.ai LLC</span>
            <span>{tf("usa_office")}</span>
            <span>{tf("phone")}</span>
            <span>{tf("email")}</span>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-[var(--foreground)] mb-4">{tf("services_title")}</h4>
          <ul className="flex flex-col gap-3 text-sm text-[var(--color-gray)]">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/services#${s.id}`} className="hover:text-[var(--color-pink)] transition-colors">{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-[var(--foreground)] mb-4">{tf("company_title")}</h4>
          <ul className="flex flex-col gap-3 text-sm text-[var(--color-gray)]">
            <li><Link href="/about" className="hover:text-[var(--color-pink)] transition-colors">{t("about")}</Link></li>
            <li><Link href="/case-studies" className="hover:text-[var(--color-pink)] transition-colors">{t("case_studies")}</Link></li>
            <li><Link href="/loyalty" className="hover:text-[var(--color-pink)] transition-colors">{t("hilo")}</Link></li>
            <li><Link href="/pricing" className="hover:text-[var(--color-pink)] transition-colors">{t("pricing")}</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--color-pink)] transition-colors">{t("contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-[var(--foreground)] mb-4">{tf("legal_title")}</h4>
          <ul className="flex flex-col gap-3 text-sm text-[var(--color-gray)]">
            <li><Link href="/privacy" className="hover:text-[var(--color-pink)] transition-colors">{tf("privacy_policy")}</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--color-pink)] transition-colors">{tf("terms_of_service")}</Link></li>
            <li><Link href="/support" className="hover:text-[var(--color-pink)] transition-colors">{tf("support")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-black/5 text-xs text-[var(--color-gray)]/60">
        <p>{tf("copyright", { year: new Date().getFullYear().toString() })}</p>
      </div>
    </footer>
  );
}
