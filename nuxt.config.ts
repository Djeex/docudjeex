import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

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
    // bundle. Without this, they fall back to a live api.iconify.design
    // request at prerender time, which times out wherever outbound access
    // is restricted. Bundling all three collections in full avoids that.
    serverBundle: {
      collections: ['simple-icons', 'lucide', 'vscode-icons'],
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
      // they just need to be prerendered.
      routes: ['/', '/robots.txt'],
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
