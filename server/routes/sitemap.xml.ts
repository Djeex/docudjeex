import { serverQueryContent } from '#content/server'

// generates /fr/sitemap.xml without @nuxtjs/sitemap (incompatible with baseURL /fr/)
export default defineEventHandler(async (event) => {
  const docs = await serverQueryContent(event).find()

  const urls = docs
    .filter((doc: any) =>
      doc._path &&
      !doc._path.startsWith('/_') &&
      !doc._path.endsWith('/_dir')
    )
    .map((doc: any) => `  <url><loc>https://docu.djeex.fr/fr${doc._path}</loc></url>`)
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
