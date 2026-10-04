import { STRAPI_URL } from "./client"

/**
 * The local upload provider returns `/uploads/...` relative to Strapi; cloud providers
 * (S3, Cloudinary) already return absolute URLs.
 */
export function getStrapiMediaUrl(url: string): string {
  if (url.startsWith("/uploads/") && STRAPI_URL) return `${STRAPI_URL}${url}`
  return url
}

const isMedia = (value: object): value is { url: string; alternativeText: unknown } =>
  "url" in value && typeof value.url === "string" && "alternativeText" in value

/** Deep-copies a Strapi response, making every media `url` absolute. Runs on the server only. */
export function withAbsoluteMediaUrls<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withAbsoluteMediaUrls) as T
  if (value === null || typeof value !== "object") return value
  if (isMedia(value)) return { ...value, url: getStrapiMediaUrl(value.url) }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, withAbsoluteMediaUrls(child)])) as T
}
