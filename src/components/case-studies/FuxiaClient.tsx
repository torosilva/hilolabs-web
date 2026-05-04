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

export default function FuxiaClient() {
  const t = useTranslations("CaseStudy");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <div className="inline-block px-3 py-1 bg-[var(--color-fuchsia)]/10 text-[var(--color-fuchsia)] border border-[var(--color-fuchsia)]/20 rounded-full font-mono text-xs uppercase tracking-widest mb-8">
            {t("hero_eyebrow")}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-lg md:text-xl max-w-2xl mx-auto font-light mb-12">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      {/* Main Image */}
      <section className="px-6 max-w-7xl mx-auto mb-24">
        <motion.div 
          {...fadeInUp}
          className="w-full aspect-[21/9] bg-[#130E1B] rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center shadow-2xl"
        >
          <Image 
            src="/fuxia_editorial.png" 
            alt="Fuxia Ballerinas App Experience" 
            fill 
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover opacity-80 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] to-transparent" />
        </motion.div>
      </section>

      {/* Live Metrics Dashboard */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.01] mb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <h2 className="font-serif text-2xl text-[var(--color-cream)] flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-fuchsia)] animate-pulse shadow-[0_0_8px_rgba(200,36,106,0.8)]" />
              {t("metrics_title")}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((metric) => (
              <motion.div key={metric} {...fadeInUp} className="bg-[#130E1B] border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-[var(--color-fuchsia)]/30 transition-colors">
                <span className="text-[var(--color-gray)] font-mono text-sm uppercase tracking-widest mb-4">
                  {t(`metric_${metric}_label` as any)}
                </span>
                <span className="text-5xl font-light text-[var(--color-cream)] font-serif group-hover:text-[var(--color-fuchsia)] transition-colors">
                  {t(`metric_${metric}_val` as any)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Columns: Story & Results */}
      <section className="py-12 px-6 max-w-6xl mx-auto mb-24">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <motion.div {...fadeInUp}>
            <h3 className="font-serif text-3xl text-[var(--color-cream)] mb-8">{t("story_title")}</h3>
            <p className="text-[var(--color-gray)] font-light leading-relaxed mb-6">
              {t("story_p1")}
            </p>
            <p className="text-[var(--color-gray)] font-light leading-relaxed">
              {t("story_p2")}
            </p>
          </motion.div>

          <motion.div {...fadeInUp}>
            <h3 className="font-serif text-3xl text-[var(--color-cream)] mb-8">{t("results_title")}</h3>
            <ul className="flex flex-col gap-6">
              {[1, 2, 3].map((r) => (
                <li key={r} className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[var(--color-fuchsia)]/10 flex items-center justify-center text-[var(--color-fuchsia)] flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5l10 -10"></path></svg>
                  </div>
                  <span className="text-[var(--color-gray)] font-light leading-relaxed">
                    {t(`result_${r}` as any)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Hero Mockup Visual */}
      <section className="px-6 max-w-5xl mx-auto mb-32">
        <motion.div 
          {...fadeInUp}
          className="w-full aspect-[4/3] md:aspect-[16/9] bg-white/[0.02] rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center shadow-xl"
        >
          <Image 
            src="/hero_mockup.png" 
            alt="Fuxia Platform Architecture" 
            fill 
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain p-8"
          />
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-8">{t("cta_final")}</h2>
          <Link href="/book-demo" className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
            {t("cta_final")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
