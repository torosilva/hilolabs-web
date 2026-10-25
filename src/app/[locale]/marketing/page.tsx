"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function MarketingPage() {
  const t = useTranslations("Marketing");

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

          <div className="space-y-8 mt-8">
            <div className="p-6 bg-[var(--color-section-bg)] rounded-2xl border border-black/5">
              <h3 className="text-xl font-serif text-[var(--foreground)] mb-2 font-normal">
                {t("section1_title")}
              </h3>
              <p className="text-[var(--color-gray)]">{t("section1_desc")}</p>
            </div>

            <div className="p-6 bg-[var(--color-section-bg)] rounded-2xl border border-black/5">
              <h3 className="text-xl font-serif text-[var(--foreground)] mb-2 font-normal">
                {t("section2_title")}
              </h3>
              <p className="text-[var(--color-gray)]">{t("section2_desc")}</p>
            </div>

            <div className="p-6 bg-[var(--color-section-bg)] rounded-2xl border border-black/5">
              <h3 className="text-xl font-serif text-[var(--foreground)] mb-2 font-normal">
                {t("section3_title")}
              </h3>
              <p className="text-[var(--color-gray)]">{t("section3_desc")}</p>
            </div>
          </div>

          <div className="p-8 bg-[var(--color-section-bg)] rounded-2xl border border-black/5 text-center mt-12">
            <h3 className="text-2xl font-serif text-[var(--foreground)] mb-3 font-normal">
              {t("cta_title")}
            </h3>
            <p className="text-sm text-[var(--color-gray)] mb-6 max-w-lg mx-auto">
              {t("cta_desc")}
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all active:scale-95 mx-auto"
            >
              {t("cta_button")}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
