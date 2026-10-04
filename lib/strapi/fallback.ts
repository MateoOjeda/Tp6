import defaultContent from "@/content/default-content.json"
import type { Flavor, Global, LandingPage } from "./types"

/**
 * Same source the CMS seed uses (`cms/scripts/seed.js`). Image references are `{ src, alt }`
 * relative to `public/`, and the flavor carousel references flavors by slug.
 */

type ImageRef = { src: string; alt: string }

const isImageRef = (value: unknown): value is ImageRef =>
  value !== null && typeof value === "object" && "src" in value && typeof value.src === "string"

function resolveImages(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(resolveImages)
  if (isImageRef(value)) return { url: `/${value.src}`, alternativeText: value.alt }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolveImages(child)]))
  }
  return value
}

const flavors = resolveImages(defaultContent.flavors) as Flavor[]
const flavorBySlug = new Map(flavors.map((flavor) => [flavor.slug, flavor]))

export const fallbackGlobal = resolveImages(defaultContent.global) as Global

export const fallbackLandingPage = resolveImages({
  ...defaultContent.landingPage,
  blocks: defaultContent.landingPage.blocks.map((block) =>
    block.__component === "blocks.flavor-carousel" && "flavors" in block
      ? { ...block, flavors: (block.flavors as string[]).map((slug) => flavorBySlug.get(slug)).filter(Boolean) }
      : block,
  ),
}) as LandingPage
