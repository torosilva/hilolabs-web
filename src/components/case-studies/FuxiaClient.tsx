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

const FUXIA_STACK = [
  "Expo / React Native",
  "Next.js",
  "Supabase",
  "PostgreSQL",
  "Python (FastAPI)",
  "Claude",
  "WooCommerce",
  "Twilio",
  "GA4",
];

type Block = { title: string; desc: string };
type Milestone = { date: string; text: string };
type Stat = { val: string; label: string };

export default function FuxiaClient() {
  const t = useTranslations("CaseStudy");
  const built = t.raw("built") as Block[];
  const timeline = t.raw("timeline") as Milestone[];
  const underHood = t.raw("under_hood") as Stat[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <div className="inline-block px-3 py-1 bg-[var(--color-fuchsia)]/10 text-[var(--color-fuchsia)] border border-[var(--color-fuchsia)]/20 rounded-full font-mono text-xs uppercase tracking-widest mb-8">
            {t("hero_eyebrow")}
          </div>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      {/* Main Image */}
      <section className="px-6 max-w-6xl mx-auto mb-20">
        <motion.div
          {...fadeInUp}
          className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl border border-black/5 relative overflow-hidden shadow-xl"
        >
          <Image
            src="/fuxia_editorial.png"
            alt="Fuxia Ballerinas"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-[50%_60%]"
          />
        </motion.div>
      </section>

      {/* Metrics */}
      <section className="py-12 px-6 border-y border-black/5 bg-black/[0.01] mb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)] text-center mb-8">{t("metrics_title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((metric) => (
              <motion.div key={metric} {...fadeInUp} className="bg-[var(--color-section-bg)] border border-black/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-light text-[var(--color-fuchsia)] font-serif mb-3">
                  {t(`metric_${metric}_val`)}
                </span>
                <span className="text-[var(--color-gray)] font-mono text-xs uppercase tracking-widest">
                  {t(`metric_${metric}_label`)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="px-6 max-w-3xl mx-auto mb-20">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-3xl text-[var(--color-cream)] mb-6">{t("challenge_title")}</h2>
          <p className="text-[var(--color-gray)] text-lg font-light leading-relaxed">{t("challenge_p")}</p>
        </motion.div>
      </section>

      {/* What we built */}
      <section className="px-6 max-w-6xl mx-auto mb-24">
        <motion.h2 {...fadeInUp} className="font-serif text-3xl text-[var(--color-cream)] mb-8">{t("built_title")}</motion.h2>
        <div className="grid md:grid-cols-2 gap-6">
          {built.map((b, i) => (
            <motion.div key={i} {...fadeInUp} className="bg-[var(--color-section-bg)] border border-black/5 rounded-2xl p-8">
              <div className="font-mono text-sm text-[var(--color-fuchsia)] mb-4">0{i + 1}</div>
              <h3 className="font-serif text-2xl text-[var(--color-cream)] mb-3">{b.title}</h3>
              <p className="text-[var(--color-gray)] font-light leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline + under the hood */}
      <section className="py-20 px-6 border-y border-black/5 mb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <motion.div {...fadeInUp}>
            <h2 className="font-serif text-3xl text-[var(--color-cream)] mb-8">{t("timeline_title")}</h2>
            <ol className="flex flex-col">
              {timeline.map((m, i) => (
                <li key={i} className="grid grid-cols-[90px_1fr] gap-4 py-4 border-b border-black/5 last:border-0">
                  <span className="font-mono text-sm text-[var(--color-fuchsia)]">{m.date}</span>
                  <span className="text-[var(--color-cream)]">{m.text}</span>
                </li>
              ))}
            </ol>
          </motion.div>
          <motion.div {...fadeInUp}>
            <h2 className="font-serif text-3xl text-[var(--color-cream)] mb-8">{t("under_hood_title")}</h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {underHood.map((s, i) => (
                <div key={i} className="bg-[var(--color-section-bg)] border border-black/5 rounded-2xl p-6">
                  <div className="font-serif text-3xl text-[var(--color-cream)] mb-1">{s.val}</div>
                  <div className="text-sm text-[var(--color-gray)]">{s.label}</div>
                </div>
              ))}
            </div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)] mb-4">{t("stack_title")}</h3>
            <div className="flex flex-wrap gap-2">
              {FUXIA_STACK.map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-full border border-black/10 text-sm text-[var(--color-cream)]">{tech}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 pb-28 px-6 text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-8">{t("cta_final")}</h2>
          <Link href="/contact" className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
            {t("cta_button")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
