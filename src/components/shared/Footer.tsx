"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("Navigation");

  return (
    <footer className="bg-[var(--color-base)] border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 md:w-48 md:h-48 overflow-hidden grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <Image src="/logo-clean.png" alt="HiloLabs Logo" fill className="object-cover" />
            </div>
          </div>
          <span className="font-serif text-2xl tracking-tight hidden md:block">HiloLabs</span>
          <p className="text-[var(--color-gray)] text-sm leading-relaxed mb-6">
            The AI infrastructure for Latina-led fashion brands.
          </p>
          <div className="flex flex-col gap-2 text-xs text-[var(--color-gray)]/60 font-mono">
            <span>Wyoming, USA</span>
            <span>Operations in Mexico City</span>
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
            <li><Link href="/investors" className="hover:text-[var(--color-pink)] transition-colors text-xs opacity-60">Investor relations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-[var(--foreground)] mb-4">Get the Playbook</h4>
          <p className="text-sm text-[var(--color-gray)] mb-4">
            Get the exact playbook we built for Fuxia. Monthly, no fluff.
          </p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="founder@brand.com" 
              className="bg-white/5 border border-white/10 rounded-l-md px-4 py-2 text-sm w-full focus:outline-none focus:border-[var(--color-fuchsia)] text-white"
            />
            <button className="bg-[var(--color-fuchsia)] text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-opacity-90">
              Join
            </button>
          </form>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--color-gray)]/60">
        <p>© {new Date().getFullYear()} HiloLabs LLC. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[var(--color-gray)]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--color-gray)]">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
