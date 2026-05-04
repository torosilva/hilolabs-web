"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function CommerceClient() {
  const t = useTranslations("Commerce");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-xl max-w-2xl mx-auto font-light mb-12">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      <section className="py-24 px-6 border-t border-white/5 bg-[#130E1B]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div {...fadeInUp} className="bg-[var(--color-base)] p-12 rounded-3xl border border-white/5">
            <h3 className="font-serif text-3xl text-[var(--color-cream)] mb-4">{t("feature_1_title")}</h3>
            <p className="text-[var(--color-gray)] font-light leading-relaxed mb-8">
              {t("feature_1_desc")}
            </p>
            <div className="w-full h-48 bg-white/5 rounded-xl border border-white/10" />
          </motion.div>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-[var(--color-base)] p-12 rounded-3xl border border-[var(--color-fuchsia)]/20">
            <h3 className="font-serif text-3xl text-[var(--color-cream)] mb-4 text-[var(--color-fuchsia)]">{t("feature_2_title")}</h3>
            <p className="text-[var(--color-gray)] font-light leading-relaxed mb-8">
              {t("feature_2_desc")}
            </p>
            <div className="w-full h-48 bg-gradient-to-br from-[var(--color-fuchsia)]/20 to-transparent rounded-xl border border-[var(--color-fuchsia)]/30" />
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <motion.div {...fadeInUp}>
          <Link href="/book-demo" className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all">
            {t("cta_final")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
