import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { BlockRenderer } from "@/components/block-renderer"
import { Footer } from "@/components/footer"
import { getGlobal, getLandingPage } from "@/lib/strapi/queries"

export async function generateMetadata(): Promise<Metadata> {
  const [global, page] = await Promise.all([getGlobal(), getLandingPage()])
  const seo = page.seo ?? global.defaultSeo
  if (!seo) return {}

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords?.split(",").map((keyword) => keyword.trim()),
    openGraph: seo.shareImage ? { images: [{ url: seo.shareImage.url }] } : undefined,
  }
}

export default async function Home() {
  const [global, page] = await Promise.all([getGlobal(), getLandingPage()])

  return (
    <main className="min-h-screen bg-background">
      <Navigation links={global.navLinks} cta={global.navCta} />
      <BlockRenderer blocks={page.blocks} />
      {global.footer && <Footer {...global.footer} />}
    </main>
  )
}
