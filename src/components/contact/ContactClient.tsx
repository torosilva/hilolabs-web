"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/site";

type FormValues = {
  name: string;
  company: string;
  needs: string[];
  message: string;
};

const inputClass =
  "w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--color-fuchsia)]";

export default function ContactClient() {
  const t = useTranslations("Contact");
  const needs = t.raw("needs") as string[];
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { needs: [] },
  });

  const onSubmit = (data: FormValues) => {
    const body = [
      `${t("name")}: ${data.name}`,
      `${t("company")}: ${data.company}`,
      `${t("need")}: ${data.needs.join(", ")}`,
      "",
      data.message,
    ].join("\n");
    const subject = `${t("email_subject")}: ${data.company || data.name}`;
    window.location.assign(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="px-6 py-24"
    >
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-cream)] mb-4">{t("hero_h1")}</h1>
        <p className="text-[var(--color-gray)] text-lg font-light">{t("hero_sub")}</p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-[2fr_1fr] gap-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[var(--color-section-bg)] border border-black/5 rounded-3xl p-8 md:p-10 flex flex-col gap-6"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2 text-sm text-[var(--color-gray)]">
              {t("name")}
              <input {...register("name", { required: true })} className={inputClass} autoComplete="name" />
              {errors.name && <span className="text-xs text-red-600">{t("required")}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--color-gray)]">
              {t("company")}
              <input {...register("company")} className={inputClass} autoComplete="organization" />
            </label>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm text-[var(--color-gray)] mb-3">{t("need")}</legend>
            <div className="flex flex-wrap gap-2">
              {needs.map((need) => (
                <label key={need} className="cursor-pointer">
                  <input type="checkbox" value={need} {...register("needs")} className="peer sr-only" />
                  <span className="inline-block px-4 py-2 rounded-full border border-black/10 bg-white text-sm text-[var(--color-cream)] peer-checked:bg-[var(--color-fuchsia)] peer-checked:border-[var(--color-fuchsia)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-fuchsia)]/40 transition-colors">
                    {need}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-sm text-[var(--color-gray)]">
            {t("message")}
            <textarea {...register("message", { required: true })} rows={6} className={inputClass} />
            {errors.message && <span className="text-xs text-red-600">{t("required")}</span>}
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button type="submit" className="bg-[var(--color-fuchsia)] text-white px-8 py-4 rounded-full font-medium hover:bg-opacity-90 transition-all active:scale-95">
              {t("submit")}
            </button>
            <span className="text-xs text-[var(--color-gray)]">{t("submit_note")}</span>
          </div>
        </form>

        <aside className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-gray)]">{t("or")}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="border border-black/10 rounded-2xl p-6 hover:border-[var(--color-fuchsia)]/50 transition-colors">
            <div className="text-sm text-[var(--color-gray)] mb-1">{t("email_label")}</div>
            <div className="text-[var(--color-cream)] font-medium">{CONTACT_EMAIL}</div>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="border border-black/10 rounded-2xl p-6 hover:border-[var(--color-fuchsia)]/50 transition-colors">
            <div className="text-sm text-[var(--color-gray)] mb-1">{t("whatsapp_label")}</div>
            <div className="text-[var(--color-cream)] font-medium">+1 (307) 363-7036</div>
          </a>
        </aside>
      </div>
    </motion.div>
  );
}
