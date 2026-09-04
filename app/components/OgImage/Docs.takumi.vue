<script lang="ts" setup>
const { title, description, headline } = defineProps<{ title?: string, description?: string, headline?: string }>()

const appConfig = useAppConfig()
const { name: siteName } = useSiteConfig()
const primaryColor = appConfig.ui?.colors?.primary ?? 'emerald'
const logoPath = appConfig.header?.logo?.dark || appConfig.header?.logo?.light
const logoHeight = 40

const logoSvg = await fetchLogoSvg(logoPath)

async function fetchLogoSvg(path?: string): Promise<string> {
  if (!path) return ''
  try {
    const { url: siteUrl } = useSiteConfig()
    const url = path.startsWith('http') ? path : `${siteUrl}${path}`
    let svg = await $fetch<string>(url, { responseType: 'text' })

    // Strip the XML prolog and comments: takumi renders them as literal text
    // instead of ignoring them like a browser's innerHTML would.
    svg = svg.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '').trim()

    // takumi doesn't resolve the SVG's own <style> class rules either (paths
    // rendered black), so inline each class's fill directly, then drop <defs>.
    const classFills = new Map(
      [...svg.matchAll(/\.(\w+)\s*\{\s*fill:\s*([^;}\s]+)/g)].map(([, className, fill]) => [className, fill]),
    )
    for (const [className, fill] of classFills) {
      svg = svg.replaceAll(`class="${className}"`, `fill="${fill}"`)
    }
    svg = svg.replace(/<defs>[\s\S]*?<\/defs>/, '').trim()

    // This logo is a wide wordmark (viewBox ~3360x576), not a square icon,
    // so width must scale from its own aspect ratio instead of a fixed value.
    const viewBox = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/)
    const width = viewBox ? Math.round(logoHeight * (Number(viewBox[1]) / Number(viewBox[2]))) : logoHeight

    return svg.replace('<svg', `<svg width="${width}" height="${logoHeight}"`)
  }
  catch {
    return ''
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-[#0B0A0A] px-[80px] py-[60px] font-[Roboto]">
    <!-- Same shape, colors and blur as the site's own :ellipsis component: a wide
         flat oval filled with its diagonal blue/cyan gradient, then blurred. -->
    <div class="absolute blur-3xl top-[80px] right-[50px] w-[900px] h-[360px] rounded-full bg-[linear-gradient(97.62deg,rgba(0,71,225,0.18)_2.27%,rgba(26,214,255,0.12)_65%,rgba(0,71,225,0.12)_98.48%)]" />

    <div class="flex-1 flex flex-col justify-center">
      <p
        v-if="headline"
        :class="`uppercase text-[22px] font-bold m-0 mb-5 tracking-[0.05em] text-${primaryColor}-500`"
      >
        {{ headline }}
      </p>
      <h1
        v-if="title"
        class="m-0 mb-6 text-[50px] font-bold text-white leading-[1.1] w-full max-w-[900px] wrap-break-word"
      >
        {{ title?.slice(0, 60) }}
      </h1>
      <p
        v-if="description"
        class="m-0 text-[28px] text-neutral-400 leading-[1.4] w-full max-w-[900px] wrap-break-word"
      >
        {{ description?.slice(0, 200) }}
      </p>
    </div>

    <div class="flex">
      <div
        v-if="logoSvg"
        class="h-[40px]"
        v-html="logoSvg"
      />
      <div v-else class="text-white text-[18px] font-normal rounded-lg px-5 py-2">
        {{ siteName }}
      </div>
    </div>
  </div>
</template>
