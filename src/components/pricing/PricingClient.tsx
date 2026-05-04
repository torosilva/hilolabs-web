"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function PricingClient() {
  const t = useTranslations("Pricing");

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

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <motion.div {...fadeInUp} className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col">
              <h3 className="text-2xl font-serif text-[var(--color-cream)] mb-2">Starter</h3>
              <p className="text-[var(--color-gray)] font-light mb-8 h-12">For boutiques ready to capture data.</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-light text-[var(--color-cream)]">$199</span>
                <span className="text-[var(--color-gray)] mb-2">/mo</span>
              </div>
              <ul className="flex flex-col gap-4 text-[var(--color-gray)] font-light mb-8 flex-1">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> Up to 5k customers</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> Loyalty Engine</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> Email Support</li>
              </ul>
              <Link href="/book-demo" className="block w-full py-4 text-center border border-white/20 rounded-full text-white hover:bg-white/5 transition-colors">
                Book demo
              </Link>
            </motion.div>

            {/* Growth */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-[#130E1B] border border-[var(--color-fuchsia)]/40 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(200,36,106,0.15)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-fuchsia)] text-white text-xs font-mono px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-serif text-[var(--color-fuchsia)] mb-2">Growth</h3>
              <p className="text-[var(--color-gray)] font-light mb-8 h-12">For scaling brands that need an app.</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-light text-[var(--color-cream)]">$499</span>
                <span className="text-[var(--color-gray)] mb-2">/mo</span>
              </div>
              <ul className="flex flex-col gap-4 text-[var(--color-gray)] font-light mb-8 flex-1">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-fuchsia)]" /> Everything in Starter</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-fuchsia)]" /> Native iOS & Android App</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-fuchsia)]" /> AI Stylist (Basic)</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-fuchsia)]" /> WhatsApp Notifications</li>
              </ul>
              <Link href="/book-demo" className="block w-full py-4 text-center bg-[var(--color-fuchsia)] rounded-full text-white hover:bg-opacity-90 transition-colors shadow-lg">
                Book demo
              </Link>
            </motion.div>

            {/* Scale */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col">
              <h3 className="text-2xl font-serif text-[var(--color-cream)] mb-2">Scale</h3>
              <p className="text-[var(--color-gray)] font-light mb-8 h-12">For established brands needing full AI.</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-light text-[var(--color-cream)]">$999</span>
                <span className="text-[var(--color-gray)] mb-2">/mo</span>
              </div>
              <ul className="flex flex-col gap-4 text-[var(--color-gray)] font-light mb-8 flex-1">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> Everything in Growth</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> 7 Full AI Agents</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> Custom Computer Vision</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /> Dedicated Account Manager</li>
              </ul>
              <Link href="/book-demo" className="block w-full py-4 text-center border border-white/20 rounded-full text-white hover:bg-white/5 transition-colors">
                Book demo
              </Link>
            </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5 max-w-4xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-12">
          <h2 className="font-serif text-3xl text-[var(--color-cream)]">{t("faq_title")}</h2>
        </motion.div>
        <div className="flex flex-col gap-6">
           <motion.div {...fadeInUp} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
             <h4 className="text-[var(--color-cream)] text-lg mb-2">{t("faq_1_q")}</h4>
             <p className="text-[var(--color-gray)] font-light leading-relaxed">{t("faq_1_a")}</p>
           </motion.div>
           <motion.div {...fadeInUp} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
             <h4 className="text-[var(--color-cream)] text-lg mb-2">{t("faq_2_q")}</h4>
             <p className="text-[var(--color-gray)] font-light leading-relaxed">{t("faq_2_a")}</p>
           </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
