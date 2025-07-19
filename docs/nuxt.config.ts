export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],
  css: ['../app/assets/css/main.css'],
  site: {
    name: 'Docus',
  },
  llms: {
    domain: 'https://docus.dev',
    title: 'Docus',
    description: 'Write beautiful docs with Markdown.',
    full: {
      title: 'Docus',
      description: 'Write beautiful docs with Markdown.',
    },
  },
})
