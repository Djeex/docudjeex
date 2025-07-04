export default defineNuxtConfig({
  // https://github.com/nuxt-themes/docus
  css: ['~/assets/css/extra.css'],
  extends: ['@nuxt-themes/docus'],
  devtools: { enabled: false },
  colorMode: { 
    preference: 'dark',
    fallback:'dark',
  },
  
  content: {
    highlight: {
      langs: [
        'console',
        'nginx',
      ]
    }
  },

  mdc: {
    highlight: {
      theme: 'github-dark',
      langs: ['ts','html','console','nginx'],
      wrapperStyle: true
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/img/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/favicon/apple-touch-icon.png' },
        { rel: 'icon', sizes: '192x192', href: '/img/favicon/android-chrome-192x192.png' },
        { rel: 'icon', sizes: '512x512', href: '/img/favicon/android-chrome-512x512.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon/favicon-16x16.png' },
        { rel: 'manifest', href: '/img/favicon/site.webmanifest' }
      ],
      meta: [
        { name: 'darkreader-lock' },
      ]
    }
  },

  compatibilityDate: '2024-10-24'
})