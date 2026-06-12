import type { NextConfig } from "next";

const securityHeaders = [
  // Force HTTPS for 1 year, include subdomains, preload into browser HSTS lists
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // Allow framing from any origin — Cinder is designed to be embedded in iframes
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions-Policy removed — restrictive policies propagate to nested iframes
  // (like Vidking player) and can trigger their sandbox detection
  // Content Security Policy - restrict what domains can load resources
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.vidking.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://image.tmdb.org https://www.vidking.net",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src https://www.youtube.com https://www.vidking.net",
      "connect-src 'self' https://www.vidking.net",
      "media-src 'self' blob: https://www.vidking.net",
      "worker-src 'self' blob:",
      "frame-ancestors *",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", "::1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
