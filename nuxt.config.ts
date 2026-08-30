import { fileURLToPath } from 'node:url'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

// @nuxt/image resolves its file-storage root differently in `nuxi dev`
// (needs an absolute path) vs a production build (needs the plain
// `public/` string — an absolute path there breaks the SVG content-type
// on the compiled `/_ipx` route). Branch on the actual nuxi subcommand.
const isDev = process.argv.includes('dev')

export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxtjs/i18n'],
  site: {
    url: 'https://docu.djeex.fr',
    name: 'Docudjeex',
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
    dir: isDev ? fileURLToPath(new URL('./public', import.meta.url)) : 'public/',
  },
  icon: {
    customCollections: [
      {
        prefix: 'brand',
        dir: resolve('./app/assets/brand-icons'),
      },
    ],
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
  // Permanent (301) redirects from the old site's French URLs (root-level,
  // no locale prefix) to their new /fr/... equivalents, so bookmarks and
  // search engine rankings carry over.
  routeRules: {
    '/apropos/bienvenue': { redirect: { to: '/fr/about/welcome', statusCode: 301 } },
    '/generalites/reseau/nat': { redirect: { to: '/fr/general/networking/nat', statusCode: 301 } },
    '/generalites/reseau/dns': { redirect: { to: '/fr/general/networking/dns', statusCode: 301 } },
    '/generalites/reseau/samba': { redirect: { to: '/fr/general/networking/samba', statusCode: 301 } },
    '/generalites/stockage/raid': { redirect: { to: '/fr/general/storage/raid', statusCode: 301 } },
    '/generalites/stockage/zfs': { redirect: { to: '/fr/general/storage/zfs', statusCode: 301 } },
    '/generalites/hardware/bases': { redirect: { to: '/fr/general/hardware/basics', statusCode: 301 } },
    '/generalites/hardware/reseau': { redirect: { to: '/fr/general/hardware/network', statusCode: 301 } },
    '/generalites/hardware/prolonas': { redirect: { to: '/fr/general/hardware/prolonas', statusCode: 301 } },
    '/serveex/introduction': { redirect: { to: '/fr/serveex/introduction', statusCode: 301 } },
    '/serveex/coeur/installation': { redirect: { to: '/fr/serveex/core/installation', statusCode: 301 } },
    '/serveex/coeur/docker': { redirect: { to: '/fr/serveex/core/docker', statusCode: 301 } },
    '/serveex/coeur/swag': { redirect: { to: '/fr/serveex/core/swag', statusCode: 301 } },
    '/serveex/securite/wireguard': { redirect: { to: '/fr/serveex/security/wireguard', statusCode: 301 } },
    '/serveex/securite/authentik': { redirect: { to: '/fr/serveex/security/authentik', statusCode: 301 } },
    '/serveex/securite/cloudflare': { redirect: { to: '/fr/serveex/security/cloudflare', statusCode: 301 } },
    '/serveex/monitoring/uptime-kuma': { redirect: { to: '/fr/serveex/monitoring/uptime-kuma', statusCode: 301 } },
    '/serveex/monitoring/dozzle': { redirect: { to: '/fr/serveex/monitoring/dozzle', statusCode: 301 } },
    '/serveex/monitoring/speedtest-tracker': { redirect: { to: '/fr/serveex/monitoring/speedtest-tracker', statusCode: 301 } },
    '/serveex/monitoring/beszel': { redirect: { to: '/fr/serveex/monitoring/beszel', statusCode: 301 } },
    '/serveex/monitoring/upsnap': { redirect: { to: '/fr/serveex/monitoring/upsnap', statusCode: 301 } },
    '/serveex/media/plex': { redirect: { to: '/fr/serveex/media/plex', statusCode: 301 } },
    '/serveex/media/qbittorrent': { redirect: { to: '/fr/serveex/media/qbittorrent', statusCode: 301 } },
    '/serveex/media/servarr': { redirect: { to: '/fr/serveex/media/servarr', statusCode: 301 } },
    '/serveex/cloud/immich': { redirect: { to: '/fr/serveex/cloud/immich', statusCode: 301 } },
    '/serveex/cloud/nextcloud': { redirect: { to: '/fr/serveex/cloud/nextcloud', statusCode: 301 } },
    '/serveex/files/file-browser': { redirect: { to: '/fr/serveex/files/file-browser', statusCode: 301 } },
    '/serveex/files/pingvin': { redirect: { to: '/fr/serveex/files/pingvin', statusCode: 301 } },
    '/serveex/development/code-server': { redirect: { to: '/fr/serveex/development/code-server', statusCode: 301 } },
    '/serveex/development/gitea': { redirect: { to: '/fr/serveex/development/gitea', statusCode: 301 } },
    '/serveex/development/it-tools': { redirect: { to: '/fr/serveex/development/it-tools', statusCode: 301 } },
    '/serveex/apps/adguard': { redirect: { to: '/fr/serveex/apps/adguard', statusCode: 301 } },
    '/serveex/apps/vaultwarden': { redirect: { to: '/fr/serveex/apps/vaultwarden', statusCode: 301 } },
    '/stockeex/introduction': { redirect: { to: '/fr/stockeex/introduction', statusCode: 301 } },
    '/betises/python/nvidia-stock-bot': { redirect: { to: '/fr/nonsense/python/nvidia-stock-bot', statusCode: 301 } },
    '/betises/python/adguard-cidre': { redirect: { to: '/fr/nonsense/python/adguard-cidre', statusCode: 301 } },
    '/betises/python/lumeex': { redirect: { to: '/fr/nonsense/python/lumeex', statusCode: 301 } },
    '/betises/python/instameex': { redirect: { to: '/fr/nonsense/python/instameex', statusCode: 301 } },
    '/betises/bash/servarr-doublons': { redirect: { to: '/fr/nonsense/bash/servarr-duplicates', statusCode: 301 } },
    '/betises/bash/luks-backup': { redirect: { to: '/fr/nonsense/bash/luks-backup', statusCode: 301 } },
    '/betises/bash/socat-proxy': { redirect: { to: '/fr/nonsense/bash/socat-proxy', statusCode: 301 } },
    '/betises/bash/hotdisk': { redirect: { to: '/fr/nonsense/bash/hotdisk', statusCode: 301 } },
    '/betises/bash/backrest-docker-stop': { redirect: { to: '/fr/nonsense/bash/backrest-docker-stop', statusCode: 301 } },
    '/Poubelle/obsolete/wireguard-14': { redirect: { to: '/fr/recycled/deprecated/wireguard-14', statusCode: 301 } },
  },
})