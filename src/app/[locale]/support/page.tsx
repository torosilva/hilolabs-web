"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function SupportPage() {
  const t = useTranslations("Support");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen px-6 py-32 flex flex-col items-center bg-white"
    >
      <div className="max-w-3xl w-full">
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--foreground)] mb-2 font-normal">
          {t("title")}
        </h1>
        <p className="text-sm text-[var(--color-gray)] font-mono mb-12">
          {t("effective_date")}
        </p>

        <div className="max-w-none text-base text-[var(--color-gray)] leading-relaxed space-y-12 font-light">
          <p className="text-lg text-[var(--foreground)] font-normal leading-relaxed">
            {t("intro")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="p-6 bg-[var(--color-section-bg)] rounded-2xl border border-black/5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-serif text-[var(--foreground)] mb-4 font-normal">
                  {t("address")}
                </h3>
                <p className="text-sm font-mono mb-4 text-[var(--foreground)]">
                  30 N Gould St Ste R<br />
                  Sheridan, WY 82801
                </p>
              </div>
              <div className="flex flex-col gap-2 font-mono text-sm text-[var(--foreground)] mt-4">
                <div>
                  <span className="text-[var(--color-gray)]">{t("email")}: </span>
                  <a href="mailto:info@hilolabs.ai" className="hover:text-[var(--color-pink)] transition-colors">
                    info@hilolabs.ai
                  </a>
                </div>
                <div>
                  <span className="text-[var(--color-gray)]">{t("phone")}: </span>
                  <a href="tel:+13073637036" className="hover:text-[var(--color-pink)] transition-colors">
                    +1 (307) 363-7036
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--color-section-bg)] rounded-2xl border border-black/5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-serif text-[var(--foreground)] mb-2 font-normal">
                  {t("cta_title")}
                </h3>
                <p className="text-sm text-[var(--color-gray)] mb-6">
                  {t("cta_desc")}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-block text-center bg-[var(--color-fuchsia)] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all active:scale-95 w-full mt-4"
              >
                {t("cta_button")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
