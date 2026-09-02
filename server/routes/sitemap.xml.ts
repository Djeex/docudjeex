import { queryCollection } from '@nuxt/content/server'
import { getAvailableLocales, getCollectionsToQuery, isNavigationPath } from 'docus/server/utils/content'

// Overrides Docus's own sitemap.xml route: theirs resolves the site URL via
// `inferSiteURL()` (docus/utils/meta.ts), which only reads deployment-platform
// env vars (Vercel/Netlify/Cloudflare Pages) or NUXT_PUBLIC_SITE_URL. On a
// plain self-hosted build none of those are set, so it silently falls back to
// an empty string and every <loc> ends up as a bare path instead of an
// absolute URL, which is invalid per the sitemap spec. `createSitePathResolver`
// builds each URL from the `site` config in nuxt.config.ts instead (the same
// source canonical/og:url already use), including the `trailingSlash` setting,
// so every URL in the sitemap stays consistent with those.
interface SitemapUrl {
  loc: string
  lastmod?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const resolveUrl = createSitePathResolver(event, { absolute: true })

  const availableLocales = getAvailableLocales(config.public as Record<string, unknown>)
  const collections = getCollectionsToQuery(undefined, availableLocales)

  if (availableLocales.length > 0) {
    for (const locale of availableLocales) {
      collections.push(`landing_${locale}`)
    }
  }
  else {
    collections.push('landing')
  }

  const urls: SitemapUrl[] = []

  for (const collection of collections) {
    try {
      const pages = await (queryCollection as unknown as (
        event: unknown,
        collection: string,
      ) => { all: () => Promise<Array<Record<string, unknown> & { path?: string }>> })(event, collection).all()

      for (const page of pages) {
        const meta = page.meta as Record<string, unknown>
        const pagePath = page.path || '/'

        // Skip pages with sitemap: false in frontmatter
        if (meta.sitemap === false) continue

        // Skip .navigation files (used for navigation configuration)
        if (isNavigationPath(pagePath)) continue

        const urlEntry: SitemapUrl = {
          loc: pagePath,
        }

        // Add lastmod if available (modifiedAt from content)
        if (meta.modifiedAt && typeof meta.modifiedAt === 'string') {
          urlEntry.lastmod = meta.modifiedAt.split('T')[0] // Use date part only (YYYY-MM-DD)
        }

        urls.push(urlEntry)
      }
    }
    catch {
      // Collection might not exist, skip it
    }
  }

  const sitemap = generateSitemap(urls, resolveUrl)

  setResponseHeader(event, 'content-type', 'application/xml')
  return sitemap
})

function generateSitemap(urls: SitemapUrl[], resolveUrl: (path: string) => string): string {
  const urlEntries = urls
    .map((url) => {
      const loc = resolveUrl(url.loc)
      let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>`

      if (url.lastmod) {
        entry += `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>`
      }

      entry += `\n  </url>`
      return entry
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
