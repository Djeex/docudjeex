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
})