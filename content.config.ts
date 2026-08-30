import type { DefinedCollection } from '@nuxt/content'
import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { useNuxt } from '@nuxt/kit'
import { joinURL } from 'ufo'
import { existsSync } from 'node:fs'

const { options } = useNuxt()
const cwd = joinURL(options.rootDir, 'content')
const locales = options.i18n?.locales

// Same checks as docus's own content.config.ts (node_modules/docus/utils/pages.ts,
// not a published package export, so reimplemented here rather than imported).
function landingPageExists(rootDir: string): boolean {
  return existsSync(joinURL(rootDir, 'app', 'pages', 'index.vue'))
}
function docsFolderExists(rootDir: string, locale?: string): boolean {
  return existsSync(locale ? joinURL(rootDir, 'content', locale, 'docs') : joinURL(rootDir, 'content', 'docs'))
}

const hasLandingPage = landingPageExists(options.rootDir)
const hasDocsFolder = docsFolderExists(options.rootDir)

// Same as docus's own createDocsSchema(), plus the two custom per-page
// frontmatter toggles used by app/pages/[[lang]]/[...slug].vue. Nuxt
// Content's Zod schema silently strips any frontmatter key that isn't
// declared here, which is why hideHeader/hideCopyPage did nothing until
// this schema was extended.
const createDocsSchema = () => z.object({
  links: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    to: z.string(),
    target: z.string().optional(),
  })).optional(),
  hideHeader: z.boolean().optional(),
  hideCopyPage: z.boolean().optional(),
  hideToc: z.boolean().optional(),
  contributors: z.array(z.string()).optional(),
})

let collections: Record<string, DefinedCollection>

if (locales && Array.isArray(locales)) {
  collections = {}
  for (const locale of locales) {
    const code = (typeof locale === 'string' ? locale : locale.code).replace('-', '_')
    const hasLocaleDocs = docsFolderExists(options.rootDir, code)

    if (!hasLandingPage) {
      collections[`landing_${code}`] = defineCollection({
        type: 'page',
        source: {
          cwd,
          include: `${code}/index.md`,
        },
      })
    }

    collections[`docs_${code}`] = defineCollection({
      type: 'page',
      source: {
        cwd,
        include: hasLocaleDocs ? `${code}/docs/**` : `${code}/**/*`,
        prefix: hasLocaleDocs ? `/${code}/docs` : `/${code}`,
        exclude: [`${code}/index.md`],
      },
      schema: createDocsSchema(),
    })
  }
}
else {
  collections = {
    docs: defineCollection({
      type: 'page',
      source: {
        cwd,
        include: hasDocsFolder ? 'docs/**' : '**',
        prefix: hasDocsFolder ? '/docs' : '/',
        exclude: ['index.md'],
      },
      schema: createDocsSchema(),
    }),
  }

  if (!hasLandingPage) {
    collections.landing = defineCollection({
      type: 'page',
      source: {
        cwd,
        include: 'index.md',
      },
    })
  }
}

export default defineContentConfig({ collections })
