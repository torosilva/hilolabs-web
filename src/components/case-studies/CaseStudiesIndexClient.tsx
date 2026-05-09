"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import Image from "next/image";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function CaseStudiesIndexClient() {
  const t = useTranslations("CaseStudiesIndex");
  const tFuxia = useTranslations("CaseStudy");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <div className="inline-block px-3 py-1 bg-[var(--color-fuchsia)]/10 text-[var(--color-fuchsia)] border border-[var(--color-fuchsia)]/20 rounded-full font-mono text-xs uppercase tracking-widest mb-8">
            {t("hero_eyebrow")}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      {/* Case study grid */}
      <section className="px-6 max-w-6xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div {...fadeInUp}>
            <Link
              href="/case-studies/fuxia"
              className="group block bg-[#130E1B] border border-white/5 rounded-3xl overflow-hidden hover:border-[var(--color-fuchsia)]/40 transition-colors shadow-2xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/fuxia_editorial.png"
                  alt="Fuxia Ballerinas"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover opacity-80 mix-blend-screen group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#130E1B] via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-fuchsia)] mb-4">
                  {tFuxia("hero_eyebrow")}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-cream)] mb-4 leading-tight">
                  {tFuxia("hero_h1")}
                </h2>
                <p className="text-[var(--color-gray)] font-light leading-relaxed mb-6">
                  {tFuxia("hero_sub")}
                </p>
                <span className="inline-block text-xs uppercase tracking-widest text-[var(--color-cream)] border-b border-[var(--color-cream)]/40 pb-1 group-hover:text-[var(--color-fuchsia)] group-hover:border-[var(--color-fuchsia)] transition-colors">
                  {t("read_case_study")}
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]"
          >
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)] mb-4">
              {t("more_eyebrow")}
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-[var(--color-cream)] mb-4">
              {t("more_title")}
            </h3>
            <p className="text-[var(--color-gray)] font-light leading-relaxed max-w-sm">
              {t("more_sub")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-8">{t("cta_final")}</h2>
          <Link
            href="/book-demo"
            className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg"
          >
            {t("cta_final_button")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
