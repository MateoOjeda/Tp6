export interface StrapiImage {
  url: string
  alternativeText: string | null
  width?: number | null
  height?: number | null
}

export interface Link {
  label: string
  href: string
  isExternal?: boolean | null
}

export interface Tag {
  label: string
}

export type IconName =
  | "zap"
  | "flame"
  | "brain"
  | "sparkles"
  | "dumbbell"
  | "building"
  | "calendar"
  | "heart"
  | "leaf"
  | "rocket"

export interface Seo {
  metaTitle: string
  metaDescription: string
  keywords?: string | null
  shareImage?: StrapiImage | null
}

export interface Flavor {
  name: string
  slug: string
  tagline: string | null
  description: string | null
  image: StrapiImage | null
  accentColor: string
  badges: Tag[]
  isMystery: boolean | null
  ctaLabel: string | null
  comingSoonLabel: string | null
}

export interface HeroBlock {
  __component: "blocks.hero"
  eyebrow: string | null
  title: string
  highlightedTitle: string | null
  subtitle: string | null
  primaryCta: Link | null
  secondaryCta: Link | null
  benefits: Tag[]
  image: StrapiImage | null
}

export interface FlavorCarouselBlock {
  __component: "blocks.flavor-carousel"
  eyebrow: string | null
  title: string
  highlightedTitle: string | null
  flavors: Flavor[]
}

export interface Feature {
  icon: IconName
  value: string
  label: string
  description: string | null
  accentColor: string | null
}

export interface FeaturesGridBlock {
  __component: "blocks.features-grid"
  eyebrow: string | null
  title: string
  items: Feature[]
}

export interface Activation {
  icon: IconName
  title: string
  description: string | null
  cta: Link | null
}

export interface ActivationsBlock {
  __component: "blocks.activations"
  eyebrow: string | null
  title: string
  highlightedTitle: string | null
  description: string | null
  items: Activation[]
}

export interface SocialPost {
  image: StrapiImage | null
  likes: string | null
  url: string | null
}

export interface SocialFeedBlock {
  __component: "blocks.social-feed"
  eyebrow: string | null
  title: string
  highlightedTitle: string | null
  posts: SocialPost[]
  cta: Link | null
}

export type Block = HeroBlock | FlavorCarouselBlock | FeaturesGridBlock | ActivationsBlock | SocialFeedBlock

export interface LandingPage {
  title: string
  seo: Seo | null
  blocks: Block[]
}

export interface LinkGroup {
  title: string
  links: Link[]
}

export interface FooterContent {
  title: string
  highlightedTitle: string | null
  newsletterPlaceholder: string | null
  newsletterButtonLabel: string
  newsletterNote: string | null
  description: string | null
  linkGroups: LinkGroup[]
  copyright: string | null
}

export interface Global {
  siteName: string
  defaultSeo: Seo | null
  navLinks: Link[]
  navCta: Link | null
  footer: FooterContent | null
}
