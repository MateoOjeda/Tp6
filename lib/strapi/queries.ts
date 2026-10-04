import { cache } from "react"
import { isStrapiConfigured, strapiFetch } from "./client"
import { fallbackGlobal, fallbackLandingPage } from "./fallback"
import { withAbsoluteMediaUrls } from "./media"
import type { Global, LandingPage } from "./types"

const IMAGE = { fields: ["url", "alternativeText", "width", "height"] }

const globalQuery = {
  populate: {
    defaultSeo: { populate: { shareImage: IMAGE } },
    navLinks: true,
    navCta: true,
    footer: { populate: { linkGroups: { populate: { links: true } } } },
  },
}

// Strapi 5 requires `on` fragments to populate each dynamic zone component.
const landingPageQuery = {
  populate: {
    seo: { populate: { shareImage: IMAGE } },
    blocks: {
      on: {
        "blocks.hero": { populate: { primaryCta: true, secondaryCta: true, benefits: true, image: IMAGE } },
        "blocks.flavor-carousel": { populate: { flavors: { populate: { image: IMAGE, badges: true } } } },
        "blocks.features-grid": { populate: { items: true } },
        "blocks.activations": { populate: { items: { populate: { cta: true } } } },
        "blocks.social-feed": { populate: { posts: { populate: { image: IMAGE } }, cta: true } },
      },
    },
  },
}

/** Without STRAPI_URL the site renders `content/default-content.json`, so the frontend runs standalone. */
export const getGlobal = cache(async (): Promise<Global> => {
  if (!isStrapiConfigured) return fallbackGlobal
  return withAbsoluteMediaUrls(await strapiFetch<Global>("global", globalQuery))
})

export const getLandingPage = cache(async (): Promise<LandingPage> => {
  if (!isStrapiConfigured) return fallbackLandingPage
  return withAbsoluteMediaUrls(await strapiFetch<LandingPage>("landing-page", landingPageQuery))
})
