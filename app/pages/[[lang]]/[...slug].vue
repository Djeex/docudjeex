<script setup lang="ts">
import { kebabCase } from 'scule'
import type { ContentNavigationItem, Collections, DocsCollectionItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()
const { locale, isEnabled, t } = useDocusI18n()
const { isOpen } = useAssistant()
const appConfig = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const collectionName = computed(() => isEnabled.value ? `docs_${locale.value}` : 'docs')

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(kebabCase(route.path), () => queryCollection(collectionName.value as keyof Collections).path(route.path).first() as Promise<DocsCollectionItem>),
  useAsyncData(`${kebabCase(route.path)}-surround`, () => {
    return queryCollectionItemSurroundings(collectionName.value as keyof Collections, route.path, {
      fields: ['description'],
    })
  }),
])

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

const headline = ref(findPageHeadline(navigation?.value, page.value?.path))
const breadcrumbs = computed(() => findPageBreadcrumbs(navigation?.value, page.value?.path || ''))

// Set `hideHeader: true` in a page's frontmatter to skip the title/description
// block entirely (e.g. for a page that builds its own custom layout).
const hideHeader = computed(() => !!(page.value as unknown as Record<string, unknown>)?.hideHeader)

// Set `hideCopyPage: true` in a page's frontmatter to hide the "Copy page"
// dropdown (copy link / view as markdown / open in ChatGPT / Claude).
const hideCopyPage = computed(() => !!(page.value as unknown as Record<string, unknown>)?.hideCopyPage)

// Set `hideToc: true` in a page's frontmatter to hide the right-hand
// "On this page" table-of-contents sidebar.
const hideToc = computed(() => !!(page.value as unknown as Record<string, unknown>)?.hideToc)

useSeo({
  title,
  description,
  type: 'article',
  modifiedAt: (page.value as unknown as Record<string, unknown>).modifiedAt as string | undefined,
  breadcrumbs,
})
watch(() => navigation?.value, () => {
  headline.value = findPageHeadline(navigation?.value, page.value?.path) || headline.value
})

defineOgImage('Docs', {
  headline: headline.value,
  title: title?.slice(0, 60),
  description: formatOgDescription(title, description),
})

const github = computed(() => appConfig.github ? appConfig.github : null)
const giteaUrl = computed(() => appConfig.socials?.gitea as string | undefined)

// "Edit this page" points at Gitea (git.djeex.fr), not the GitHub mirror.
// Gitea's edit route is `/{owner}/{repo}/_edit/{branch}/{path}` (note the
// leading underscore — different from GitHub's `/edit/{branch}/{path}`).
const editLink = computed(() => {
  if (!giteaUrl.value) {
    return
  }

  return [
    giteaUrl.value,
    '_edit',
    'main',
    'content',
    `${page.value?.stem}.${page.value?.extension}`,
  ].filter(Boolean).join('/')
})

const contributors = computed(() => (page.value as unknown as Record<string, unknown>)?.contributors as string[] | undefined)

const historyLink = computed(() => {
  if (!giteaUrl.value) {
    return
  }

  return [
    giteaUrl.value,
    'commits',
    'branch',
    'main',
    'content',
    `${page.value?.stem}.${page.value?.extension}`,
  ].filter(Boolean).join('/')
})

// Add the page path to the prerender list
addPrerenderPath(`/raw${route.path}.md`)
</script>

<template>
  <UPage
    v-if="page"
    class="relative"
    :ui="isOpen ? { center: 'lg:col-span-10' } : undefined"
  >
    <UPageHeader
      v-if="!hideHeader"
      :title="page.title"
      :description="page.description"
      :headline="headline"
      :ui="{
        wrapper: 'flex-row items-center flex-wrap justify-between',
      }"
    >
      <template #links>
        <UButton
          v-for="(link, index) in (page as DocsCollectionItem).links"
          :key="index"
          size="sm"
          v-bind="link"
        />

        <DocsPageHeaderLinks v-if="!hideCopyPage" />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <USeparator v-if="giteaUrl || github">
        <div
          class="flex items-center gap-2 text-sm text-muted max-[420px]:flex-col"
        >
          <UButton
            v-if="editLink"
            variant="link"
            color="neutral"
            :to="editLink"
            target="_blank"
            icon="i-lucide-pen"
            :ui="{ leadingIcon: 'size-4' }"
          >
            {{ t('docs.edit') }}
          </UButton>
          <template v-if="giteaUrl">
            <span>{{ t('common.or') }}</span>
            <UButton
              variant="link"
              color="neutral"
              :to="`${giteaUrl}/issues/new`"
              target="_blank"
              icon="i-lucide-alert-circle"
              :ui="{ leadingIcon: 'size-4' }"
            >
              {{ t('docs.report') }}
            </UButton>
          </template>
        </div>
      </USeparator>
      <div
        v-if="contributors?.length"
        class="flex items-center gap-2 text-sm text-muted"
      >
        <UIcon
          name="i-lucide-users"
          class="size-4 shrink-0"
        />
        <span>{{ locale === 'fr' ? (contributors.length > 1 ? 'Contributeurs' : 'Contributeur') : (contributors.length > 1 ? 'Contributors' : 'Contributor') }}:</span>
        <ULink
          v-if="historyLink"
          :to="historyLink"
          target="_blank"
          class="text-highlighted hover:underline"
        >
          {{ contributors.join(', ') }}
        </ULink>
        <span v-else>{{ contributors.join(', ') }}</span>
      </div>
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="!isOpen && !hideToc"
      #right
    >
      <DocsAsideRight
        :page="page"
      />
    </template>
  </UPage>
</template>
