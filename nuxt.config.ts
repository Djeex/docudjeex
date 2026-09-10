import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

// Every `i-<collection>-<name>` icon referenced from content/*.md or
// content/**/.navigation.yml needs both its collection (for serverBundle,
// used during SSR/prerender) and its exact name (for clientBundle, used
// client-side) listed below, but Nuxt Icon's own static scanner only looks
// at .vue/.ts source, not content, so it can't find any of these on its
// own. Scanning content here instead of hand-maintaining both lists means a
// newly used icon gets bundled automatically on the next build; the only
// manual step left is `npm install @iconify-json/<name>` for a genuinely
// new collection, and a missing one now fails the build loudly (unresolved
// import) instead of silently breaking at runtime behind the CSP (icons
// falling back to a live, blocked api.iconify.design call).
function scanContentIcons(): { collections: string[], icons: string[] } {
  // Collection prefixes can contain hyphens themselves (simple-icons,
  // fluent-color), same as the separator before the icon name, so a plain
  // "first segment" split is ambiguous. Matching against the actual
  // installed @iconify-json package names, longest first, resolves it.
  const installed = readdirSync(resolve('./node_modules/@iconify-json'))
    .sort((a, b) => b.length - a.length)
  const collections = new Set<string>()
  const icons = new Set<string>()
  const pattern = /icon=["']i-([a-z0-9-]+)["']|icon:\s*["']?i-([a-z0-9-]+)/g
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      }
      // .navigation.yml files set a section's nav icon (e.g. `icon:
      // i-lucide-chart-no-axes-column`) and are just as invisible to this
      // scan as markdown content is to Nuxt Icon's own .vue/.ts scanner if
      // only .md files are walked here, which is exactly how the first
      // version of this function missed them.
      else if (entry.name.endsWith('.md') || entry.name.endsWith('.yml')) {
        const text = readFileSync(full, 'utf8')
        for (const match of text.matchAll(pattern)) {
          const iconRef = match[1] ?? match[2]
          const collection = installed.find(name => iconRef === name || iconRef.startsWith(`${name}-`))
          // Falls back to the first segment for a collection that isn't
          // installed yet: still wrong, but it now surfaces as a clear
          // "cannot resolve @iconify-json/<name>" build error to fix,
          // rather than a silent runtime CSP block.
          const resolved = collection ?? iconRef.split('-')[0]
          collections.add(resolved)
          icons.add(`${resolved}:${iconRef.slice(resolved.length + 1)}`)
        }
      }
    }
  }
  walk(resolve('./content'))
  // 'brand' is the local customCollections prefix (app/assets/brand-icons),
  // not an installable Iconify package, and never needs live/API resolution.
  collections.delete('brand')
  const brandPrefix = /^brand:/
  return {
    collections: [...collections],
    icons: [...icons].filter(icon => !brandPrefix.test(icon)),
  }
}
const contentIcons = scanContentIcons()

// None of the top-level content sections has a landing page of its own,
// just a first numbered article inside the folder, so the bare section URL
// (/en/serveex/) has nothing to serve on the static build. Deriving the
// redirect target from the content tree here, instead of hand-listing each
// section, means adding, renaming or reordering a section's first article
// keeps working on its own, with nothing to update in this file or in
// SWAG's config.
function getSectionIndexRedirects(): Record<string, { redirect: { to: string, statusCode: 301 } }> {
  const rules: Record<string, { redirect: { to: string, statusCode: 301 } }> = {}
  for (const lang of ['en', 'fr']) {
    const langDir = resolve(`./content/${lang}`)
    for (const section of readdirSync(langDir, { withFileTypes: true })) {
      if (!section.isDirectory()) continue
      const sectionSlug = section.name.replace(/^\d+\./, '')
      const firstFile = readdirSync(join(langDir, section.name), { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))[0]
      if (!firstFile) continue
      const fileSlug = firstFile.name.replace(/^\d+\./, '').replace(/\.md$/, '')
      rules[`/${lang}/${sectionSlug}/`] = { redirect: { to: `/${lang}/${sectionSlug}/${fileSlug}/`, statusCode: 301 } }
    }
  }
  return rules
}

// Contributors per page: read straight from git history rather than an
// API, so it needs no token and no network call, but the CI checkout must
// fetch full history (not a shallow clone) or every file will only show
// its most recent author.
function getContributors(absoluteFilePath: string): string[] {
  try {
    const output = execFileSync(
      'git',
      ['log', '--format=%an', '--follow', '--', absoluteFilePath],
      { cwd: resolve('.'), encoding: 'utf8' },
    )
    return [...new Set(output.split('\n').map(line => line.trim()).filter(Boolean))]
  }
  catch {
    return []
  }
}

export default defineNuxtConfig({
  extends: ['docus'],
  components: [
    // Passing an array here replaces Nuxt's default `~/components` scan
    // instead of adding to it, so every local override under app/components/
    // (AppHeaderCenter, AppHeaderBottom, DocsAsideLeftTop, etc.) was silently
    // ignored in favor of the docus layer's originals. Keep the default scan.
    '~/components',
    // ProseNote/Tip/Warning/Caution are only ever resolved dynamically, by
    // name, from Nuxt Content's MDC tag map (`note` -> `ProseNote`, etc.).
    // Nothing statically imports or writes `<ProseNote>` in a template, so
    // Vite's production build can't see them as used and tree-shakes them
    // out of both the client and server bundles entirely: every admonition
    // then renders as a raw, unstyled `<ProseNote>` tag instead of the
    // actual callout. Marking this folder global forces them into the
    // bundle regardless. `nuxt dev` never hits this: it serves components
    // on demand and doesn't tree-shake.
    { path: '~/components/prose', pathPrefix: false, global: true },
  ],
  modules: ['@nuxtjs/i18n'],
  site: {
    url: 'https://docu.djeex.fr',
    name: 'Docudjeex',
    // The build produces a static site (Nitro's default `autoSubfolderIndex`
    // writes every route as `path/index.html`), so canonical/og:url/sitemap
    // must carry the trailing slash too, matching what's actually on disk.
    // Without this, canonical points to the no-slash URL while the static
    // host's directory redirect sends visitors (and crawlers) to the slash
    // version, creating a redirect loop that keeps pages out of the index.
    trailingSlash: true,
  },
  app: {
    head: {
      // Same as the old site: stops the Dark Reader browser extension from
      // rewriting inline styles (e.g. the cyan "·" spans), which otherwise
      // shows up as a (harmless but noisy) Vue hydration-mismatch warning.
      meta: [
        { name: 'darkreader-lock', content: 'true' },
      ],
    },
  },
  image: {
    // Must be absolute: a plain 'public/' string resolves against whatever
    // the IPX handler's cwd happens to be at request time, which isn't
    // reliably the project root during a production prerender crawl.
    // Every single /_ipx/* request 404s (IPX_FILE_NOT_FOUND) otherwise.
    dir: fileURLToPath(new URL('./public', import.meta.url)),
  },
  icon: {
    // This site builds to a fully static export (nginx serving prerendered
    // files, no Nitro server at runtime), so the `/api/_nuxt_icon` route
    // Nuxt Icon's client falls back to for anything not in clientBundle
    // doesn't exist in production: that fallback goes straight to the live
    // Iconify API instead, which the CSP's connect-src blocks.
    // `provider: 'none'` looked like the right fix (it's Nuxt Icon's own
    // documented recommendation for static sites) but it turned out to
    // disable dynamic icon resolution altogether, including the local
    // serverBundle lookup during prerendering itself, not just the live-API
    // fallback: every vscode-icons file-type icon (resolved dynamically by
    // extension, not as a literal string) started failing to load with a
    // build-time warning instead of rendering from the bundle like before.
    // `fallbackToApi: false` alone gets the one thing that actually
    // matters, no code path is left that can ever reach the live API,
    // without taking the local resolution mechanism down with it.
    fallbackToApi: false,
    customCollections: [
      {
        prefix: 'brand',
        dir: resolve('./app/assets/brand-icons'),
      },
    ],
    // app.config.ts's codeIcon map resolves simple-icons/lucide names
    // dynamically (not as a literal `i-xxx` string anywhere), and
    // FileTreeNode.vue resolves vscode-icons file-type icons the same way,
    // so Nuxt Icon's static scanner can't pick any of them up for the local
    // bundle. Without this, they'd hit the now-disabled live-API fallback
    // above during prerender and log a build warning instead of rendering.
    // Bundling all three collections in full sidesteps that.
    // Everything else used as a literal icon in content/*.md or
    // .navigation.yml is added by scanContentIcons() above, so a new
    // collection introduced in an article gets bundled automatically
    // instead of needing a manual addition here.
    serverBundle: {
      collections: [...new Set(['simple-icons', 'lucide', 'vscode-icons', ...contentIcons.collections])],
    },
    // The codeIcon values above, forced into the content-hashed client
    // bundle instead of relying on the runtime route: that route's URL
    // doesn't change between builds, so a browser or CDN caching an old (or,
    // before the serverBundle fix above, broken) response for it kept
    // serving that stale result until the cache expired or was purged,
    // which is what "icon disappears until a hard refresh" actually was.
    // `scan: true` catches any other icon used literally in .vue/.ts
    // source; scanContentIcons() above covers content the same way it does
    // for serverBundle. vscode-icons' per-file-extension icons aren't
    // listed here: there are too many to enumerate and new file types keep
    // appearing in content, so an unbundled one falls back to the runtime
    // route client-side, same as before this whole fix, just no longer for
    // every collection used in content.
    clientBundle: {
      scan: true,
      icons: [...new Set([
        'lucide:folder-tree',
        'lucide:settings',
        'simple-icons:apple',
        'simple-icons:linux',
        'simple-icons:windows',
        ...contentIcons.icons,
      ])],
    },
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            light: 'github-dark',
            dark: 'github-dark',
          },
          langs: ['nginx', 'properties', 'php', 'toml', 'console', 'sh', 'yaml'],
        },
      },
    },
  },
  nitro: {
    prerender: {
      // Docus sets this to `false`, which writes every route as `path.html`.
      // That contradicts `site.trailingSlash` above (canonical/og:url/sitemap
      // all end in `/`) and the production host, which 301-redirects a bare
      // path to its slash form. Back to `path/index.html` so what's on disk
      // matches the URLs we advertise.
      autoSubfolderIndex: true,
      // Docus only seeds `/en` and `/fr` (one per locale), so neither `/` nor
      // `/robots.txt` is ever written and both 404 on a static host — `/` loses
      // the redirect to the default locale, and robots.txt loses the `Sitemap:`
      // line pointing crawlers at sitemap.xml. Both routes exist server-side,
      // they just need to be prerendered. `/404.html` doesn't match any real
      // route either, so crawling it renders Docus's own error page, which
      // nginx then serves for every actual 404 instead of its bare default.
      routes: ['/', '/robots.txt', '/404.html'],
    },
  },
  // Keeps <NuxtLink> hrefs (including the ones i18n's switchLocalePath builds
  // for hreflang) ending in a slash, matching `site.trailingSlash` and the
  // directory-style files written by `autoSubfolderIndex` above.
  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: [{
      code: 'en',
      name: 'English',
    }, {
      code: 'fr',
      name: 'Français',
    }],
  },
  hooks: {
    'content:file:afterParse': (ctx: { file: { path?: string }, content: Record<string, unknown> }) => {
      if (!ctx.file.path?.endsWith('.md')) return
      ctx.content.contributors = getContributors(ctx.file.path)
    },
  },
  // Permanent (301) redirects from the production site's URLs to their v2
  // equivalents. Production serves English at the root (/serveex/introduction/)
  // and French under /fr/ with French slugs (/fr/serveex/coeur/installation/),
  // so both sets need rules. Targets carry the trailing slash to match
  // `site.trailingSlash` and avoid a second hop.
  //
  // French pages whose old slug already matches the new one (/fr/serveex/dozzle
  // and friends, where the words are the same in both languages) are absent on
  // purpose: a rule there would redirect the page to itself.
  routeRules: {
    ...getSectionIndexRedirects(),

    // English, previously served at the site root.
    '/about/welcome': { redirect: { to: '/en/about/welcome/', statusCode: 301 } },
    '/general/networking/nat': { redirect: { to: '/en/general/networking/nat/', statusCode: 301 } },
    '/general/networking/dns': { redirect: { to: '/en/general/networking/dns/', statusCode: 301 } },
    '/general/networking/samba': { redirect: { to: '/en/general/networking/samba/', statusCode: 301 } },
    '/general/storage/raid': { redirect: { to: '/en/general/storage/raid/', statusCode: 301 } },
    '/general/storage/zfs': { redirect: { to: '/en/general/storage/zfs/', statusCode: 301 } },
    '/general/hardware/basics': { redirect: { to: '/en/general/hardware/basics/', statusCode: 301 } },
    '/general/hardware/network': { redirect: { to: '/en/general/hardware/network/', statusCode: 301 } },
    '/general/hardware/prolonas': { redirect: { to: '/en/general/hardware/prolonas/', statusCode: 301 } },
    '/serveex/introduction': { redirect: { to: '/en/serveex/introduction/', statusCode: 301 } },
    '/serveex/core/installation': { redirect: { to: '/en/serveex/core/installation/', statusCode: 301 } },
    '/serveex/core/docker': { redirect: { to: '/en/serveex/core/docker/', statusCode: 301 } },
    '/serveex/core/swag': { redirect: { to: '/en/serveex/core/swag/', statusCode: 301 } },
    '/serveex/security/wireguard': { redirect: { to: '/en/serveex/core/wireguard/', statusCode: 301 } },
    '/serveex/security/authentik': { redirect: { to: '/en/serveex/advanced/authentik/', statusCode: 301 } },
    '/serveex/security/cloudflare': { redirect: { to: '/en/serveex/security/cloudflare/', statusCode: 301 } },
    '/serveex/monitoring/uptime-kuma': { redirect: { to: '/en/serveex/monitoring/uptime-kuma/', statusCode: 301 } },
    '/serveex/monitoring/dozzle': { redirect: { to: '/en/serveex/monitoring/dozzle/', statusCode: 301 } },
    '/serveex/monitoring/speedtest-tracker': { redirect: { to: '/en/serveex/monitoring/speedtest-tracker/', statusCode: 301 } },
    '/serveex/monitoring/beszel': { redirect: { to: '/en/serveex/monitoring/beszel/', statusCode: 301 } },
    '/serveex/monitoring/upsnap': { redirect: { to: '/en/serveex/monitoring/upsnap/', statusCode: 301 } },
    '/serveex/media/plex': { redirect: { to: '/en/recycled/alternatives/plex/', statusCode: 301 } },
    '/serveex/media/qbittorrent': { redirect: { to: '/en/serveex/media/qbittorrent/', statusCode: 301 } },
    '/serveex/media/servarr': { redirect: { to: '/en/serveex/media/servarr/', statusCode: 301 } },
    '/serveex/cloud/immich': { redirect: { to: '/en/serveex/cloud/immich/', statusCode: 301 } },
    '/serveex/cloud/nextcloud': { redirect: { to: '/en/serveex/cloud/nextcloud/', statusCode: 301 } },
    '/serveex/files/file-browser': { redirect: { to: '/en/recycled/deprecated/file-browser/', statusCode: 301 } },
    '/serveex/files/pingvin': { redirect: { to: '/en/serveex/files/pingvin/', statusCode: 301 } },
    '/serveex/development/code-server': { redirect: { to: '/en/serveex/development/code-server/', statusCode: 301 } },
    '/serveex/development/gitea': { redirect: { to: '/en/recycled/alternatives/gitea/', statusCode: 301 } },
    '/serveex/development/it-tools': { redirect: { to: '/en/serveex/development/it-tools/', statusCode: 301 } },
    '/serveex/apps/adguard': { redirect: { to: '/en/serveex/apps/adguard/', statusCode: 301 } },
    '/serveex/apps/vaultwarden': { redirect: { to: '/en/serveex/apps/vaultwarden/', statusCode: 301 } },
    '/stockeex/introduction': { redirect: { to: '/en/stockeex/introduction/', statusCode: 301 } },
    '/nonsense/python/nvidia-stock-bot': { redirect: { to: '/en/nonsense/python/nvidia-stock-bot/', statusCode: 301 } },
    '/nonsense/python/adguard-cidre': { redirect: { to: '/en/nonsense/python/adguard-cidre/', statusCode: 301 } },
    '/nonsense/python/lumeex': { redirect: { to: '/en/nonsense/python/lumeex/', statusCode: 301 } },
    '/nonsense/python/instameex': { redirect: { to: '/en/nonsense/python/instameex/', statusCode: 301 } },
    '/nonsense/bash/servarr-duplicates': { redirect: { to: '/en/nonsense/bash/servarr-duplicates/', statusCode: 301 } },
    '/nonsense/bash/luks-backup': { redirect: { to: '/en/nonsense/bash/luks-backup/', statusCode: 301 } },
    '/nonsense/bash/socat-proxy': { redirect: { to: '/en/nonsense/bash/socat-proxy/', statusCode: 301 } },
    '/nonsense/bash/hotdisk': { redirect: { to: '/en/nonsense/bash/hotdisk/', statusCode: 301 } },
    '/nonsense/bash/backrest-docker-stop': { redirect: { to: '/en/nonsense/bash/backrest-docker-stop/', statusCode: 301 } },
    '/recycled/deprecated/wireguard-14': { redirect: { to: '/en/recycled/deprecated/wireguard-14/', statusCode: 301 } },
    // French, previously served under /fr/ with French slugs.
    '/fr/apropos/bienvenue': { redirect: { to: '/fr/about/welcome/', statusCode: 301 } },
    '/fr/generalites/reseau/nat': { redirect: { to: '/fr/general/networking/nat/', statusCode: 301 } },
    '/fr/generalites/reseau/dns': { redirect: { to: '/fr/general/networking/dns/', statusCode: 301 } },
    '/fr/generalites/reseau/samba': { redirect: { to: '/fr/general/networking/samba/', statusCode: 301 } },
    '/fr/generalites/stockage/raid': { redirect: { to: '/fr/general/storage/raid/', statusCode: 301 } },
    '/fr/generalites/stockage/zfs': { redirect: { to: '/fr/general/storage/zfs/', statusCode: 301 } },
    '/fr/generalites/hardware/bases': { redirect: { to: '/fr/general/hardware/basics/', statusCode: 301 } },
    '/fr/generalites/hardware/reseau': { redirect: { to: '/fr/general/hardware/network/', statusCode: 301 } },
    '/fr/generalites/hardware/prolonas': { redirect: { to: '/fr/general/hardware/prolonas/', statusCode: 301 } },
    '/fr/serveex/coeur/installation': { redirect: { to: '/fr/serveex/core/installation/', statusCode: 301 } },
    '/fr/serveex/coeur/docker': { redirect: { to: '/fr/serveex/core/docker/', statusCode: 301 } },
    '/fr/serveex/coeur/swag': { redirect: { to: '/fr/serveex/core/swag/', statusCode: 301 } },
    '/fr/serveex/securite/wireguard': { redirect: { to: '/fr/serveex/core/wireguard/', statusCode: 301 } },
    '/fr/serveex/securite/authentik': { redirect: { to: '/fr/serveex/advanced/authentik/', statusCode: 301 } },
    '/fr/serveex/securite/cloudflare': { redirect: { to: '/fr/serveex/security/cloudflare/', statusCode: 301 } },
    '/fr/serveex/media/plex': { redirect: { to: '/fr/recycled/alternatives/plex/', statusCode: 301 } },
    '/fr/serveex/files/file-browser': { redirect: { to: '/fr/recycled/deprecated/file-browser/', statusCode: 301 } },
    '/fr/serveex/development/gitea': { redirect: { to: '/fr/recycled/alternatives/gitea/', statusCode: 301 } },
    '/fr/betises/python/nvidia-stock-bot': { redirect: { to: '/fr/nonsense/python/nvidia-stock-bot/', statusCode: 301 } },
    '/fr/betises/python/adguard-cidre': { redirect: { to: '/fr/nonsense/python/adguard-cidre/', statusCode: 301 } },
    '/fr/betises/python/lumeex': { redirect: { to: '/fr/nonsense/python/lumeex/', statusCode: 301 } },
    '/fr/betises/python/instameex': { redirect: { to: '/fr/nonsense/python/instameex/', statusCode: 301 } },
    '/fr/betises/bash/servarr-doublons': { redirect: { to: '/fr/nonsense/bash/servarr-duplicates/', statusCode: 301 } },
    '/fr/betises/bash/luks-backup': { redirect: { to: '/fr/nonsense/bash/luks-backup/', statusCode: 301 } },
    '/fr/betises/bash/socat-proxy': { redirect: { to: '/fr/nonsense/bash/socat-proxy/', statusCode: 301 } },
    '/fr/betises/bash/hotdisk': { redirect: { to: '/fr/nonsense/bash/hotdisk/', statusCode: 301 } },
    '/fr/betises/bash/backrest-docker-stop': { redirect: { to: '/fr/nonsense/bash/backrest-docker-stop/', statusCode: 301 } },
    '/fr/poubelle/obsolete/wireguard-14': { redirect: { to: '/fr/recycled/deprecated/wireguard-14/', statusCode: 301 } },
  },
})
