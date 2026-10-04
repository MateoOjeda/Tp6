import { timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { STRAPI_CACHE_TAG } from "@/lib/strapi/client"

function isAuthorized(request: NextRequest) {
  const secret = process.env.STRAPI_WEBHOOK_SECRET
  const header = request.headers.get("authorization")
  if (!secret || !header) return false

  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

/**
 * Strapi webhook target (Settings → Webhooks). Configure it with the header
 * `Authorization: Bearer <STRAPI_WEBHOOK_SECRET>` and the entry publish/unpublish/update/delete
 * and media events.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ revalidated: false }, { status: 401 })
  }

  const payload = (await request.json().catch(() => ({}))) as { event?: string; model?: string }

  // Every page query shares this tag: a flavor or a media file can appear inside the landing page.
  revalidateTag(STRAPI_CACHE_TAG, "max")

  return NextResponse.json({ revalidated: true, event: payload.event, model: payload.model, now: Date.now() })
}
