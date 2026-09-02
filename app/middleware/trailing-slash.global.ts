// The build produces a static site (Nitro's default `autoSubfolderIndex`
// writes every route as `path/index.html`), and the web server that serves
// those files 301-redirects a bare directory path to its slash-terminated
// form. Docus's own canonical/og:url logic (useSeo.ts) just does
// `joinURL(site.url, route.path)`, with no awareness of that, so any link
// or bookmark missing the slash renders a canonical tag pointing right back
// at itself, minus the slash the server then redirects to: a loop that
// keeps the page out of the index. Redirecting here, before the page ever
// renders, means `route.path` already carries the slash everywhere that
// matters (canonical, og:url, hreflang, JSON-LD, the sitemap).
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.endsWith('/')) return
  // Leave actual files (sitemap.xml, favicon.ico, ...) alone.
  if (to.path.includes('.')) return

  return navigateTo(to.fullPath + '/', { redirectCode: 301 })
})
