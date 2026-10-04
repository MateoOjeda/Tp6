import { Fragment } from "react"
import { ActivationsSection } from "@/components/activations-section"
import { BentoGrid } from "@/components/bento-grid"
import { FlavorCarousel } from "@/components/flavor-carousel"
import { HeroSection } from "@/components/hero-section"
import { SocialSection } from "@/components/social-section"
import type { Block } from "@/lib/strapi/types"

function renderBlock(block: Block) {
  switch (block.__component) {
    case "blocks.hero":
      return <HeroSection {...block} />
    case "blocks.flavor-carousel":
      return <FlavorCarousel {...block} />
    case "blocks.features-grid":
      return <BentoGrid {...block} />
    case "blocks.activations":
      return <ActivationsSection {...block} />
    case "blocks.social-feed":
      return <SocialSection {...block} />
    default:
      // A block added in Strapi before the frontend supports it is skipped instead of crashing the page.
      return null
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) => <Fragment key={`${block.__component}-${index}`}>{renderBlock(block)}</Fragment>)
}
