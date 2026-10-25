import type { Metadata } from "next";
import { Inter_Tight, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import "../globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const META = {
  en: {
    title: "HiloLabs | Custom software for SMBs",
    description: "We design, build, and run mobile apps, internal systems, ecommerce integrations, and AI agents for small and mid-sized businesses in Mexico, Colombia, and the U.S.",
  },
  es: {
    title: "HiloLabs | Software a la medida para pymes",
    description: "Diseñamos, construimos y operamos apps, sistemas internos, integraciones de ecommerce y agentes de IA para pymes en México, Colombia y EE.UU.",
  },
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return META[locale === "es" ? "es" : "en"];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${interTight.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
