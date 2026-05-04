"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export default function AIClient() {
  const t = useTranslations("AI");

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
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight text-[var(--color-cream)] mb-6">
            {t("hero_h1").replace('24/7.', '')}
            <span className="italic text-[var(--color-fuchsia)]">24/7.</span>
          </h1>
          <p className="text-[var(--color-gray)] text-lg md:text-xl max-w-2xl mx-auto font-light mb-10">
            {t("hero_sub")}
          </p>
        </motion.div>
      </section>

      {/* Agents Layout */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-32">
            {[1, 2, 3, 4, 5, 6, 7].map((agent, i) => (
              <motion.div 
                key={agent} 
                {...fadeInUp}
                className={`flex flex-col ${i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}
              >
                {/* Agent Visual */}
                <div className="w-full md:w-1/2 h-[400px] bg-[#130E1B] rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[var(--color-fuchsia)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Abstract Agent UI based on index */}
                  <div className="absolute inset-8 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm bg-white/[0.01]">
                     <div className="flex justify-between items-center border-b border-white/10 pb-4">
                       <div className="w-3 h-3 rounded-full bg-[var(--color-fuchsia)] animate-pulse" />
                       <span className="font-mono text-xs text-[var(--color-gray)]">{t(`agent_${agent}_stack` as any).split('+')[0]}</span>
                     </div>
                     <div className="flex-1 mt-6 flex flex-col gap-4">
                        <div className="w-3/4 h-8 bg-white/5 rounded-md" />
                        <div className="w-1/2 h-8 bg-white/5 rounded-md" />
                        {i === 0 || i === 1 ? (
                           <div className="w-full h-8 bg-[var(--color-fuchsia)]/20 rounded-md self-end mt-auto" />
                        ) : null}
                     </div>
                  </div>
                </div>

                {/* Agent Content */}
                <div className="w-full md:w-1/2 flex flex-col items-start">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-xs text-[var(--color-gray)] mb-6">
                    AGENT {agent}
                  </div>
                  <h2 className="font-serif text-3xl md:text-5xl text-[var(--color-cream)] mb-6">
                    {t(`agent_${agent}_title` as any).replace(/^\d+\.\s*/, '')}
                  </h2>
                  <p className="text-[var(--color-gray)] text-lg font-light leading-relaxed mb-8">
                    {t(`agent_${agent}_desc` as any)}
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full">
                    <div className="text-xs uppercase tracking-widest font-mono text-[var(--color-gray)] mb-2">Technical Stack</div>
                    <div className="font-mono text-sm text-[var(--color-fuchsia)]">
                      {t(`agent_${agent}_stack` as any)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Consolidado */}
      <section className="py-32 px-6 border-y border-white/5 bg-[var(--color-base)]">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="font-serif text-4xl text-[var(--color-cream)]">{t("tech_stack_title")}</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
             {[
               { name: "Core Models", val: "Claude 3.5 Sonnet, Gemini 1.5 Pro" },
               { name: "Vector Database", val: "Vertex AI Vector Search / pgvector" },
               { name: "Computer Vision", val: "Custom PyTorch models" },
               { name: "Orchestration", val: "LangChain, Claude" },
               { name: "Uptime", val: "99.99% SLA" },
               { name: "Latency", val: "< 800ms avg response" }
             ].map((item, i) => (
               <motion.div key={i} {...fadeInUp} className="flex justify-between items-center p-4 border border-white/10 rounded-lg bg-[#130E1B]">
                 <span className="text-[var(--color-gray)]">{item.name}</span>
                 <span className="text-[var(--color-fuchsia)] text-right">{item.val}</span>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 text-center">
        <motion.div {...fadeInUp}>
          <Link href="/book-demo" className="inline-block bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
            {t("cta_final")}
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
