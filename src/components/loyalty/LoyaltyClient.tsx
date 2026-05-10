"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function LoyaltyClient() {
  const t = useTranslations("Loyalty");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div variants={fadeInUp} initial="initial" animate="whileInView">
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1")}
          </h1>
          <p className="text-[var(--color-gray)] text-lg md:text-xl max-w-2xl mx-auto font-light mb-10">
            {t("how_it_works_title")} is simple. Unify your customer data, launch a branded app, and let our AI handle the rest.
          </p>
          <div className="w-full h-[400px] md:h-[500px] bg-[var(--color-base)] rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-fuchsia)]/10 to-transparent" />
             {/* Abstract wireframe of the platform */}
             <div className="relative w-64 h-full border-x border-white/10 flex flex-col items-center justify-end pb-8">
               <div className="w-48 h-80 bg-[#130E1B] rounded-2xl border border-white/20 shadow-lg relative overflow-hidden">
                 <div className="absolute top-4 left-4 right-4 h-12 bg-white/5 rounded-lg" />
                 <div className="absolute top-20 left-4 right-4 bottom-4 bg-[var(--color-fuchsia)]/10 rounded-lg flex flex-col gap-2 p-2">
                   <div className="w-full h-1/3 bg-[var(--color-fuchsia)]/20 rounded-md" />
                   <div className="w-full h-1/3 bg-[var(--color-fuchsia)]/20 rounded-md" />
                   <div className="w-full h-1/3 bg-[var(--color-fuchsia)]/20 rounded-md" />
                 </div>
               </div>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--color-base)] to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-cream)]">{t("how_it_works_title")}</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-px bg-white/10" />
            
            {[1, 2, 3].map((step) => (
              <motion.div key={step} {...fadeInUp} transition={{ delay: step * 0.1 }} className="relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-base)] border border-[var(--color-fuchsia)]/40 flex items-center justify-center text-[var(--color-fuchsia)] font-mono z-10 shadow-[0_0_15px_rgba(200,36,106,0.2)] mb-6">
                  {step}
                </div>
                <h3 className="text-xl font-serif text-[var(--color-cream)] mb-3">{t(`step_${step}_title` as any)}</h3>
                <p className="text-[var(--color-gray)] font-light leading-relaxed max-w-sm">{t(`step_${step}_desc` as any)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div {...fadeInUp} className="mb-16 md:mb-24">
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)] max-w-2xl leading-tight">
            {t("features_title")}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((f) => (
            <motion.div key={f} {...fadeInUp} className="bg-[#130E1B] p-10 rounded-3xl border border-white/5 group hover:border-[var(--color-fuchsia)]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-fuchsia)]/10 flex items-center justify-center text-[var(--color-fuchsia)] mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5l10 -10"></path></svg>
              </div>
              <h3 className="text-2xl font-serif text-[var(--color-cream)] mb-4">{t(`feature_${f}_title` as any)}</h3>
              <p className="text-[var(--color-gray)] font-light leading-relaxed">{t(`feature_${f}_desc` as any)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-6 bg-[var(--color-cream)] text-[var(--color-base)]">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">{t("pricing_title")}</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {["starter", "growth", "scale"].map((tier, idx) => (
              <motion.div key={tier} {...fadeInUp} transition={{ delay: idx * 0.1 }} className="bg-white rounded-3xl p-8 border border-black/5 shadow-xl relative flex flex-col">
                {tier === "growth" && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-fuchsia)] text-white text-xs font-mono uppercase tracking-wider px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-2xl font-serif mb-2">{t(`tier_${tier}` as any)}</h3>
                <p className="text-gray-500 font-light mb-8 h-12">{t(`tier_${tier}_desc` as any)}</p>
                
                <div className="mt-auto pt-8 border-t border-black/5">
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-4xl font-light">${tier === "starter" ? "199" : tier === "growth" ? "499" : "999"}</span>
                    <span className="text-gray-400 font-mono text-sm mb-1">/mo</span>
                  </div>
                  <Link href="/book-demo" className={`block w-full py-3 rounded-full text-center font-medium transition-colors ${tier === "growth" ? "bg-[var(--color-fuchsia)] text-white hover:bg-opacity-90" : "bg-black/5 text-black hover:bg-black/10"}`}>
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)]">{t("comparison_title")}</h2>
        </motion.div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-6 px-4 font-serif text-xl text-[var(--color-cream)]">Features</th>
                <th className="py-6 px-4 font-serif text-xl text-[var(--color-fuchsia)] w-1/4">HiloLabs</th>
                <th className="py-6 px-4 font-serif text-xl text-[var(--color-gray)] w-1/4 opacity-60">Smile.io + WooCommerce</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-gray)] font-light">
              {[
                "Branded Native iOS/Android App",
                "Embedded AI Stylist",
                "WhatsApp Conversational AI",
                "Unified CDP",
                "No coding required"
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-6 px-4">{row}</td>
                  <td className="py-6 px-4 text-[var(--color-fuchsia)]">✓ Included</td>
                  <td className="py-6 px-4 opacity-50">✕ Requires Agency</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-4xl text-[var(--color-cream)] mb-8">Ready to see Hilo in action?</h2>
          <Link href="/book-demo" className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
            {t("cta_final")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
