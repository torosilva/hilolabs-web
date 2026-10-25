export const CONTACT_EMAIL = "info@hilolabs.ai";
export const WHATSAPP_NUMBER = "13073637036";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const TECH_STACK = [
  "React Native",
  "Expo",
  "Next.js",
  "Supabase",
  "PostgreSQL",
  "Python",
  "Claude",
  "WooCommerce",
  "Twilio",
  "Vercel",
];

export type Service = {
  id: string;
  title: string;
  desc: string;
  bullets: string[];
  proof: string;
};

export type Step = { title: string; desc: string };
