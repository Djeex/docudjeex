export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { docus } = useAppConfig()
  const canonicalUrl = computed(() => `${docus.url}${route.path}`)

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    meta: [
      { property: 'og:url', content: canonicalUrl }
    ]
  })
})
