"use client";

import { motion } from "framer-motion";

export default function BookDemoPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24"
    >
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)] mb-4">
          Book a Discovery Call
        </h1>
        <p className="text-[var(--color-gray)] text-lg font-light">
          Let's discuss how HiloLabs can weave technology into your brand.
        </p>
      </div>

      {/* Cal.com Placeholder Interface */}
      <div className="w-full max-w-4xl bg-[var(--color-base)] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-fuchsia)] to-transparent opacity-50" />
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Meeting Details */}
          <div className="md:w-1/3 border-r border-white/5 pr-8">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 mb-6 relative">
              {/* Profile pic placeholder */}
              <div className="absolute inset-0 bg-[var(--color-fuchsia)]/20 flex items-center justify-center text-[var(--color-fuchsia)] font-serif text-xl">
                M
              </div>
            </div>
            <h3 className="text-xl text-[var(--color-cream)] mb-2">Mario Silva</h3>
            <h4 className="text-2xl font-serif text-[var(--color-cream)] mb-4">Discovery Call</h4>
            <div className="flex flex-col gap-3 text-sm text-[var(--color-gray)]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-white/50 border border-white/30 rounded-full flex items-center justify-center text-[10px]">🕒</span>
                30 Min
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-white/50 border border-white/30 rounded-full flex items-center justify-center text-[10px]">📍</span>
                Google Meet
              </div>
            </div>
            <p className="text-sm text-[var(--color-gray)] mt-6 leading-relaxed">
              We'll discuss your current tech stack, your goals, and see if Hilo Loyalty is the right fit to scale your brand.
            </p>
          </div>

          {/* Right Column: Calendar Placeholder */}
          <div className="md:w-2/3 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-[var(--color-fuchsia)]/10 flex items-center justify-center border border-[var(--color-fuchsia)]/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-fuchsia)" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-lg text-[var(--color-cream)] mb-2">Calendar Integration Pending</h3>
            <p className="text-sm text-[var(--color-gray)] max-w-md">
              (This space is reserved for the Cal.com embed. Once Mario's calendar link is provided, it will be injected here directly).
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
