import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async redirects() {
    return [
      // HTTP → HTTPS (belt-and-suspenders; Vercel also handles this at CDN level)
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://anleggstorget.no/:path*',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // NASTA AS scraper — machine images from Mascus marketplace
        protocol: 'https',
        hostname: 'st.mascus.com',
      },
      {
        protocol: 'https',
        hostname: 'images.finncdn.no',
      },
      {
        protocol: 'https',
        hostname: '*.finncdn.no',
      },
      {
        protocol: 'https',
        hostname: 'www.oslomaskin.com',
      },
      {
        // Oslo Maskin image CDN (redirect target from oslomaskin.com/uploads/*)
        protocol: 'https',
        hostname: 'images.publisher.extra-cdn.com',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'anleggstorget',
  project: 'anleggstorget-web',
  silent: !process.env.CI,
  disableLogger: true,
  automaticVercelMonitors: true,
});
