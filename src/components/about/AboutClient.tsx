"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

type Value = { title: string; desc: string };

export default function AboutClient() {
  const t = useTranslations("About");
  const values = t.raw("values") as Value[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      <section className="pt-24 pb-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-xl max-w-2xl mx-auto font-light">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      <section className="py-24 px-6 border-y border-black/5 bg-black/[0.01]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-6">{t("mission_title")}</h2>
            <p className="text-[var(--color-gray)] text-xl font-light leading-relaxed max-w-3xl mx-auto">
              {t("mission_desc")}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} {...fadeInUp} className="bg-white border border-black/5 rounded-2xl p-8">
                <h3 className="font-serif text-xl text-[var(--color-cream)] mb-3">{v.title}</h3>
                <p className="text-[var(--color-gray)] font-light leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 max-w-3xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-6">{t("founder_title")}</h2>
          <p className="text-[var(--color-gray)] text-lg font-light leading-relaxed mb-10">
            {t("founder_desc")}
          </p>
          <Link href="/contact" className="inline-block bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95">
            {t("meet_founders")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
