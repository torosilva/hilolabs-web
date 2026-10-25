import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/:locale(en|es)/:path(ai|commerce)", destination: "/:locale/services", permanent: true },
      { source: "/:locale(en|es)/book-demo", destination: "/:locale/contact", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
