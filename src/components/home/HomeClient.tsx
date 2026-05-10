"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";

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

export default function HomeClient() {
  const t = useTranslations("Home");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="w-full overflow-hidden"
    >
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          className="lg:w-1/2 flex flex-col items-start z-10"
          initial="initial" animate="animate" variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="px-3 py-1 border border-[var(--color-fuchsia)]/30 rounded-full text-xs font-mono text-[var(--color-fuchsia)] mb-6 tracking-wide">
            {t("hero_eyebrow")}
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1").replace('technology', '').replace('tecnología', '')}
            <span className="italic text-[var(--color-fuchsia)]">{t("hero_h1").includes('technology') ? 'technology.' : 'tecnología.'}</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-[var(--color-gray)] text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-sans font-light">
            {t("hero_sub")}
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/book-demo" className="bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(200,36,106,0.3)] w-full sm:w-auto text-center">
              {t("cta_book_demo")}
            </Link>
            <Link href="/case-studies" className="text-[var(--color-cream)] font-medium hover:text-[var(--color-pink)] transition-colors hilo-line pb-1">
              {t("cta_see_fuxia")}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:w-1/2 relative z-0 w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5"
        >
          <Image src="/hero_mockup.png" alt="HiloLabs Platform Mockup" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-transparent to-transparent opacity-80" />
        </motion.div>
      </section>

      {/* 2. Trust Bar */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-mono text-[var(--color-gray)] uppercase tracking-widest mb-8">
            {t("trust_bar")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
            <div className="font-serif text-2xl font-bold tracking-tight">FUXIA</div>
            <div className="font-serif text-xl italic tracking-widest">AURA</div>
            <div className="font-sans font-black text-2xl tracking-tighter">VOLANT</div>
            <div className="font-serif text-2xl font-light">MAREA</div>
          </div>
        </div>
      </section>

      {/* 3. Problem Statement */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="font-serif text-3xl md:text-5xl leading-tight text-[var(--color-cream)]">
            "{t("problem_text")}"
          </h2>
        </motion.div>
      </section>

      {/* 4. Pillars */}
      <section className="py-24 px-6 bg-[#130E1B]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((num) => (
              <motion.div 
                key={num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: num * 0.1 }}
                className="bg-[var(--color-base)] p-8 rounded-2xl border border-white/5 relative group hover:border-[var(--color-fuchsia)]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-[var(--color-fuchsia)]/30 flex items-center justify-center mb-8">
                  {/* Custom SVG icon placeholder */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-fuchsia)" strokeWidth="1.5">
                    {num === 1 && <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />}
                    {num === 2 && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                    {num === 3 && <path d="M12 2a10 10 0 1 0 10 10H12V2zM21.18 8.02c-1-2.3-2.85-4.17-5.16-5.18" />}
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-[var(--color-cream)] mb-3">{t(`pillar_${num}_title`)}</h3>
                <p className="text-[var(--color-gray)] font-light leading-relaxed">{t(`pillar_${num}_desc`)}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[var(--color-fuchsia)] to-[var(--color-pink)] group-hover:w-full transition-all duration-500 rounded-b-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Product: Loyalty & 6. Case Fuxia */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)] mb-6">
              {t("product_loyalty_title")}
            </h2>
            <ul className="space-y-4 mb-10">
              {['Branded loyalty app (white-label)', 'Storefront integrado (WooCommerce)', 'AI agents (WhatsApp, AI Stylist)', 'Operator dashboard'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[var(--color-gray)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-fuchsia)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/loyalty" className="text-[var(--color-fuchsia)] font-medium hover:text-[var(--color-pink)] transition-colors inline-flex items-center gap-2 group">
              {t("cta_explore_loyalty")}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#130E1B] rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <span className="font-serif text-8xl">"</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              <div>
                <div className="text-3xl font-mono text-[var(--color-fuchsia)] mb-1">30%</div>
                <div className="text-xs text-[var(--color-gray)] uppercase tracking-wider">MoM Growth</div>
              </div>
              <div>
                <div className="text-3xl font-mono text-[var(--color-fuchsia)] mb-1">12k+</div>
                <div className="text-xs text-[var(--color-gray)] uppercase tracking-wider">Members</div>
              </div>
              <div className="hidden md:block">
                <div className="text-3xl font-mono text-[var(--color-fuchsia)] mb-1">2.4x</div>
                <div className="text-xs text-[var(--color-gray)] uppercase tracking-wider">AOV Lift</div>
              </div>
            </div>

            <p className="text-xl md:text-2xl font-serif text-[var(--color-cream)] leading-snug mb-8">
              {t("fuxia_quote")}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden relative border border-white/10">
                  <Image src="/fuxia_editorial.png" alt="Carolina Muñoz" fill className="object-cover" />
                </div>
                <div className="text-sm">
                  <div className="text-[var(--color-cream)] font-medium">{t("fuxia_author").split(',')[0]}</div>
                  <div className="text-[var(--color-gray)]">{t("fuxia_author").split(',')[1]}</div>
                </div>
              </div>
            </div>
            
            <Link href="/case-studies" className="mt-8 inline-block text-xs uppercase tracking-widest text-[var(--color-gray)] hover:text-[var(--color-cream)] transition-colors border-b border-[var(--color-gray)]/30 pb-1">
              {t("cta_read_fuxia")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 7. CTA Final */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--color-fuchsia)]/20 to-transparent border border-[var(--color-fuchsia)]/20 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-1 bg-[var(--color-fuchsia)] blur-sm opacity-50" />
          
          <h2 className="font-serif text-3xl md:text-5xl text-[var(--color-cream)] mb-8">
            {t("final_cta_title")}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/book-demo" className="bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg w-full sm:w-auto">
              {t("cta_book_demo")}
            </Link>
            <Link href="/contact" className="text-[var(--color-cream)] font-medium hover:text-[var(--color-pink)] transition-colors w-full sm:w-auto hilo-line pb-1">
              {t("cta_talk_founder")}
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
