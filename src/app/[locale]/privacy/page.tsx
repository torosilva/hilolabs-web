"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

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

        <div className="max-w-none text-base text-[var(--color-gray)] leading-relaxed space-y-8 font-light">
          <p className="text-lg text-[var(--foreground)] font-normal mb-8 leading-relaxed">
            {t("intro")}
          </p>

          <div>
            <h2 className="text-xl font-serif text-[var(--foreground)] mb-3 font-normal">
              {t("section1_title")}
            </h2>
            <p className="text-[var(--color-gray)]">{t("section1_text")}</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--foreground)] mb-3 font-normal">
              {t("section2_title")}
            </h2>
            <p className="text-[var(--color-gray)]">{t("section2_text")}</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--foreground)] mb-3 font-normal">
              {t("section3_title")}
            </h2>
            <p className="text-[var(--color-gray)]">{t("section3_text")}</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-[var(--foreground)] mb-3 font-normal">
              {t("section4_title")}
            </h2>
            <p className="text-[var(--color-gray)]">{t("section4_text")}</p>
          </div>

          <div className="p-6 bg-[var(--color-section-bg)] rounded-2xl border border-black/5 mt-12">
            <h2 className="text-xl font-serif text-[var(--foreground)] mb-4 font-normal">
              {t("section5_title")}
            </h2>
            <p className="mb-4 text-[var(--color-gray)]">{t("section5_text")}</p>
            <div className="flex flex-col gap-2 font-mono text-sm text-[var(--foreground)]">
              <div>
                <span className="text-[var(--color-gray)]">Email: </span>
                <a href={`mailto:${t("contact_email")}`} className="hover:text-[var(--color-pink)] transition-colors">
                  {t("contact_email")}
                </a>
              </div>
              <div>
                <span className="text-[var(--color-gray)]">Phone: </span>
                <a href={`tel:${t("contact_phone")}`} className="hover:text-[var(--color-pink)] transition-colors">
                  {t("contact_phone")}
                </a>
              </div>
              <div>
                <span className="text-[var(--color-gray)]">Address: </span>
                <span>{t("contact_address")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
