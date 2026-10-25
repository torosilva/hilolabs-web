"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import ServiceIcon from "@/components/shared/ServiceIcon";
import { WHATSAPP_URL, type Service, type Step } from "@/lib/site";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const inView = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 }
};

export default function HomeClient() {
  const t = useTranslations("Home");
  const ts = useTranslations("Services");
  const services = ts.raw("items") as Service[];
  const steps = ts.raw("process_steps") as Step[];
  const heroItems = t.raw("hero_card_items") as string[];
  const proofItems = t.raw("proof_items") as string[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      {/* 1. Hero */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div
          className="lg:w-[58%] flex flex-col items-start z-10"
          initial="initial" animate="animate" variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="px-3 py-1 border border-[var(--color-fuchsia)]/30 rounded-full text-xs font-mono text-[var(--color-fuchsia)] mb-6 tracking-wide">
            {t("hero_eyebrow")}
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1")}{" "}
            <span className="italic text-[var(--color-fuchsia)]">{t("hero_h1_accent")}</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-[var(--color-gray)] text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-sans font-light">
            {t("hero_sub")}
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link href="/contact" className="bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(180,95,36,0.25)] w-full sm:w-auto text-center">
              {t("cta_primary")}
            </Link>
            <Link href="/case-studies/fuxia" className="text-[var(--color-cream)] font-medium hover:text-[var(--color-pink)] transition-colors hilo-line pb-1">
              {t("cta_secondary")}
            </Link>
          </motion.div>
        </motion.div>

        {/* Tarjeta: lo que está en producción */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:w-[42%] w-full"
        >
          <div className="bg-[var(--color-section-bg)] border border-black/5 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)]">{t("hero_card_title")}</span>
            </div>
            <ul className="flex flex-col gap-3">
              {heroItems.map((item, i) => {
                const [name, detail] = item.split(" · ");
                return (
                  <li key={i} className="bg-white border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-[var(--color-fuchsia)]/30 flex items-center justify-center flex-shrink-0">
                      <ServiceIcon id={["apps", "operations", "commerce", "ai"][i]} size={18} />
                    </div>
                    <div>
                      <div className="text-[var(--color-cream)] font-medium">{name}</div>
                      <div className="text-sm text-[var(--color-gray)]">{detail}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between gap-4">
              <Image src="/logo-fuxia.svg" alt="Fuxia" width={110} height={19} />
              <span className="text-xs text-[var(--color-gray)] text-right">{t("hero_card_footer")}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Proof bar */}
      <section className="py-12 border-y border-black/5 bg-black/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-mono text-[var(--color-gray)] uppercase tracking-widest mb-8 text-center">
            {t("proof_title")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {proofItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-[var(--color-cream)]">
                <svg className="mt-1 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-fuchsia)" strokeWidth="3"><path d="M5 12l5 5l10 -10" /></svg>
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Problem */}
      <section className="py-28 px-6 max-w-4xl mx-auto text-center">
        <motion.h2 {...inView} className="font-serif text-3xl md:text-4xl leading-tight text-[var(--color-cream)]">
          {t("problem_text")}
        </motion.h2>
      </section>

      {/* 4. Services */}
      <section className="py-24 px-6 bg-[var(--color-section-bg)]">
        <div className="max-w-7xl mx-auto">
          <motion.div {...inView} className="mb-14 max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-fuchsia)] mb-4">{t("services_eyebrow")}</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)]">{t("services_title")}</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  href={`/services#${s.id}`}
                  className="h-full bg-white p-8 rounded-2xl border border-black/5 relative group hover:border-[var(--color-fuchsia)]/50 transition-colors shadow-sm flex flex-col"
                >
                  <div className="w-12 h-12 rounded-full border border-[var(--color-fuchsia)]/30 flex items-center justify-center mb-6">
                    <ServiceIcon id={s.id} />
                  </div>
                  <h3 className="text-xl font-serif text-[var(--color-cream)] mb-3">{s.title}</h3>
                  <p className="text-[var(--color-gray)] font-light leading-relaxed">{s.desc}</p>
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[var(--color-fuchsia)] to-[var(--color-pink)] group-hover:w-full transition-all duration-500 rounded-b-2xl" />
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="rounded-2xl border border-dashed border-black/15 p-8 flex items-center justify-center"
            >
              <Link href="/services" className="text-[var(--color-fuchsia)] font-medium hover:text-[var(--color-pink)] transition-colors">
                {t("services_cta")}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Case Fuxia */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...inView} className="flex flex-col items-start">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-fuchsia)] mb-4">{t("case_eyebrow")}</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)] mb-6 leading-tight">
              {t("case_title")}
            </h2>
            <p className="text-[var(--color-gray)] text-lg font-light leading-relaxed mb-10">{t("case_desc")}</p>
            <Link href="/case-studies/fuxia" className="text-[var(--color-fuchsia)] font-medium hover:text-[var(--color-pink)] transition-colors">
              {t("cta_read_fuxia")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[var(--color-section-bg)] rounded-3xl p-8 md:p-12 border border-black/5 relative overflow-hidden shadow-sm"
          >
            <div className="grid grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((n) => (
                <div key={n}>
                  <div className="text-3xl font-mono text-[var(--color-fuchsia)] mb-1">{t(`metric_${n}_val`)}</div>
                  <div className="text-xs text-[var(--color-gray)] uppercase tracking-wider">{t(`metric_${n}_label`)}</div>
                </div>
              ))}
            </div>

            <p className="text-xl md:text-2xl font-serif text-[var(--color-cream)] leading-snug mb-8">
              {t("fuxia_quote")}
            </p>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-fuchsia)]/10 border border-[var(--color-fuchsia)]/20 flex items-center justify-center font-serif text-[var(--color-fuchsia)]">
                CM
              </div>
              <div className="text-sm">
                <div className="text-[var(--color-cream)] font-medium">{t("fuxia_author")}</div>
                <div className="text-[var(--color-gray)]">{t("fuxia_role")}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Process */}
      <section className="py-24 px-6 bg-[var(--color-section-bg)] border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <motion.div {...inView} className="mb-14 max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-fuchsia)] mb-4">{t("process_eyebrow")}</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)]">{t("process_title")}</h2>
          </motion.div>
          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-black/5 p-8"
              >
                <div className="font-mono text-sm text-[var(--color-fuchsia)] mb-6">0{i + 1}</div>
                <h3 className="font-serif text-xl text-[var(--color-cream)] mb-3">{step.title}</h3>
                <p className="text-[var(--color-gray)] font-light leading-relaxed">{step.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Product: Hilo */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div {...inView} className="border border-black/10 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-fuchsia)] mb-4">{t("product_eyebrow")}</div>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-cream)] mb-4">{t("product_title")}</h2>
            <p className="text-[var(--color-gray)] font-light leading-relaxed">{t("product_desc")}</p>
          </div>
          <Link href="/loyalty" className="flex-shrink-0 text-[var(--color-fuchsia)] font-medium hover:text-[var(--color-pink)] transition-colors">
            {t("product_cta")}
          </Link>
        </motion.div>
      </section>

      {/* 8. CTA Final */}
      <section className="pb-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--color-fuchsia)]/15 to-transparent border border-[var(--color-fuchsia)]/20 rounded-3xl p-10 md:p-20 text-center relative overflow-hidden"
        >
          <h2 className="font-serif text-3xl md:text-5xl text-[var(--color-cream)] mb-6">
            {t("final_cta_title")}
          </h2>
          <p className="text-[var(--color-gray)] text-lg font-light max-w-xl mx-auto mb-10">{t("final_cta_sub")}</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/contact" className="bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg w-full sm:w-auto">
              {t("cta_primary")}
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-cream)] font-medium hover:text-[var(--color-pink)] transition-colors hilo-line pb-1">
              {t("cta_whatsapp")}
            </a>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
