import qs from "qs"

export const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, "")
export const STRAPI_CACHE_TAG = "strapi"

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN
// In development every request hits Strapi so edits show up without configuring the webhook.
const REVALIDATE_SECONDS =
  process.env.NODE_ENV === "development" ? 0 : Number(process.env.STRAPI_REVALIDATE_SECONDS ?? 3600)

export const isStrapiConfigured = Boolean(STRAPI_URL)

export class StrapiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = "StrapiError"
  }
}

/**
 * Fetches `/api/{path}` and returns the unwrapped `data` field.
 * Throws on failure so ISR keeps serving the last good render instead of caching an error.
 */
export async function strapiFetch<T>(path: string, query: Record<string, unknown> = {}): Promise<T> {
  if (!STRAPI_URL) {
    throw new StrapiError("STRAPI_URL is not configured")
  }

  const search = qs.stringify(query, { encodeValuesOnly: true })
  const url = `${STRAPI_URL}/api/${path}${search ? `?${search}` : ""}`

  const response = await fetch(url, {
    headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : undefined,
    next: { revalidate: REVALIDATE_SECONDS, tags: [STRAPI_CACHE_TAG, `strapi:${path}`] },
  })

  if (!response.ok) {
    const hint = response.status === 404 ? " (is the entry created and published? try `npm run seed` in cms/)" : ""
    throw new StrapiError(`Strapi request to /api/${path} failed with ${response.status}${hint}`, response.status)
  }

  const json = (await response.json()) as { data: T }
  return json.data
}
