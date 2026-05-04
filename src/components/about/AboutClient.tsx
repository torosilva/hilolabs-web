"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function AboutClient() {
  const t = useTranslations("About");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div {...fadeInUp}>
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-xl max-w-2xl mx-auto font-light mb-12">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
             <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-6">{t("mission_title")}</h2>
             <p className="text-[var(--color-gray)] text-xl font-light leading-relaxed">
               {t("mission_desc")}
             </p>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp} className="w-full aspect-square bg-[#130E1B] rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-fuchsia)]/20 to-transparent" />
            <div className="font-serif text-6xl text-[var(--color-fuchsia)] opacity-50">HILO</div>
          </motion.div>
          <motion.div {...fadeInUp}>
            <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-6">{t("founder_title")}</h2>
            <p className="text-[var(--color-gray)] text-lg font-light leading-relaxed mb-10">
              {t("founder_desc")}
            </p>
            <Link href="/book-demo" className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all">
              Meet the founders
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
