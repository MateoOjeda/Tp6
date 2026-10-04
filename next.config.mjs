/** @type {import('next').NextConfig} */

const strapiUrl = process.env.STRAPI_URL ? new URL(process.env.STRAPI_URL) : null

const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: strapiUrl
      ? [
          {
            protocol: strapiUrl.protocol.replace(":", ""),
            hostname: strapiUrl.hostname,
            port: strapiUrl.port,
            pathname: "/uploads/**",
          },
        ]
      : [],
  },
}

export default nextConfig
