"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("Navigation");
  const tf = useTranslations("Footer");

  return (
    <footer className="bg-[var(--color-section-bg)] border-t border-black/5 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex justify-start mb-6">
            <div className="relative w-[189px] h-[60px] flex-shrink-0 opacity-80 hover:opacity-100 transition-all duration-300">
              <Image src="/logo-brand-clean.png" alt="Hilo Labs Logo" fill className="object-contain" />
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
          <h4 className="font-serif text-[var(--foreground)] mb-4">Platform</h4>
          <ul className="flex flex-col gap-3 text-sm text-[var(--color-gray)]">
            <li><Link href="/loyalty" className="hover:text-[var(--color-pink)] transition-colors">{t("loyalty")}</Link></li>
            <li><Link href="/ai" className="hover:text-[var(--color-pink)] transition-colors">{t("ai")}</Link></li>
            <li><Link href="/commerce" className="hover:text-[var(--color-pink)] transition-colors">{t("commerce")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-[var(--foreground)] mb-4">Company</h4>
          <ul className="flex flex-col gap-3 text-sm text-[var(--color-gray)]">
            <li><Link href="/about" className="hover:text-[var(--color-pink)] transition-colors">{t("about")}</Link></li>
            <li><Link href="/case-studies" className="hover:text-[var(--color-pink)] transition-colors">{t("case_studies")}</Link></li>
            <li><Link href="/pricing" className="hover:text-[var(--color-pink)] transition-colors">{t("pricing")}</Link></li>
            <li><Link href="/investors" className="hover:text-[var(--color-pink)] transition-colors text-xs opacity-60">{tf("investors")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-[var(--foreground)] mb-4">{tf("playbook_title")}</h4>
          <p className="text-sm text-[var(--color-gray)] mb-4">
            {tf("playbook_desc")}
          </p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="founder@brand.com" 
              className="bg-black/5 border border-black/10 rounded-l-md px-4 py-2 text-sm w-full focus:outline-none focus:border-[var(--color-fuchsia)] text-[var(--foreground)]"
            />
            <button className="bg-[var(--color-fuchsia)] text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-opacity-90">
              {tf("playbook_button")}
            </button>
          </form>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--color-gray)]/60">
        <p>{tf("copyright", { year: new Date().getFullYear().toString() })}</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[var(--color-gray)]">{tf("privacy_policy")}</Link>
          <Link href="/terms" className="hover:text-[var(--color-gray)]">{tf("terms_of_service")}</Link>
        </div>
      </div>
    </footer>
  );
}
