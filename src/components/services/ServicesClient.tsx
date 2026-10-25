"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import ServiceIcon from "@/components/shared/ServiceIcon";
import { TECH_STACK, type Service, type Step } from "@/lib/site";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function ServicesClient() {
  const t = useTranslations("Services");
  const services = t.raw("items") as Service[];
  const steps = t.raw("process_steps") as Step[];
  const fit = t.raw("fit_items") as string[];

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
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.1] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-lg md:text-xl max-w-2xl mx-auto font-light">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      {/* Service lines */}
      <section className="px-6 max-w-6xl mx-auto pb-24 flex flex-col gap-6">
        {services.map((s) => (
          <motion.article
            key={s.id}
            id={s.id}
            {...fadeInUp}
            className="scroll-mt-28 bg-[var(--color-section-bg)] border border-black/5 rounded-3xl p-8 md:p-12 grid md:grid-cols-[1fr_1fr] gap-10"
          >
            <div>
              <div className="w-12 h-12 rounded-full border border-[var(--color-fuchsia)]/30 bg-white flex items-center justify-center mb-6">
                <ServiceIcon id={s.id} />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-cream)] mb-4">{s.title}</h2>
              <p className="text-[var(--color-gray)] text-lg font-light leading-relaxed">{s.desc}</p>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <ul className="flex flex-col gap-4">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-[var(--color-cream)]">
                    <svg className="mt-1.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-fuchsia)" strokeWidth="3"><path d="M5 12l5 5l10 -10" /></svg>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)] mr-2">{t("proof_label")}</span>
                  <span className="text-[var(--color-cream)]">{s.proof}</span>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Fit + process */}
      <section className="py-24 px-6 border-y border-black/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-16">
          <motion.div {...fadeInUp}>
            <h2 className="font-serif text-3xl text-[var(--color-cream)] mb-8">{t("fit_title")}</h2>
            <ul className="flex flex-col gap-5">
              {fit.map((f, i) => (
                <li key={i} className="text-[var(--color-gray)] font-light leading-relaxed border-l-2 border-[var(--color-fuchsia)]/40 pl-4">{f}</li>
              ))}
            </ul>
          </motion.div>
          <ol className="grid sm:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <motion.li key={i} {...fadeInUp} className="bg-[var(--color-section-bg)] rounded-2xl border border-black/5 p-8">
                <div className="font-mono text-sm text-[var(--color-fuchsia)] mb-6">0{i + 1}</div>
                <h3 className="font-serif text-xl text-[var(--color-cream)] mb-3">{step.title}</h3>
                <p className="text-[var(--color-gray)] font-light leading-relaxed">{step.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stack */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)] mb-8">{t("stack_title")}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-full border border-black/10 text-sm text-[var(--color-cream)]">{tech}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-black/5 text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-8">{t("cta_title")}</h2>
          <Link href="/contact" className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
            {t("cta_button")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
