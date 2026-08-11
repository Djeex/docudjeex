export default defineNuxtPlugin(() => {
  const route = useRoute()
  const canonicalUrl = withSiteUrl(computed(() => route.path), { canonical: true })

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    meta: [
      { property: 'og:url', content: canonicalUrl }
    ]
  })
})
