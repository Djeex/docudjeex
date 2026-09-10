<script setup lang="ts">
// Overrides Nuxt Content's default ProseImg (which renders every markdown
// image as a plain <img>, or through NuxtImg only if it happens to detect
// one registered): every raster image is re-encoded to WebP, which alone
// cuts most screenshots down substantially, and capped at 1280px wide.
// NuxtImg's `width` prop doubles as the rendered <img>'s HTML width
// attribute, not just the resize target, so passing 1280 unconditionally
// would stretch a smaller source (a 1024px screenshot, say) up to fill
// that width in the browser, blurry on every display. `imageWidths`
// (nuxt.config.ts's scanImageWidths) holds each image's real width, read
// once at build time, so undersized images are only re-encoded, not
// stretched. SVGs are already tiny vector files and would gain nothing
// from either step, so they're left untouched.
const props = defineProps<{
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
}>()

const config = useRuntimeConfig()
const isSvg = computed(() => props.src?.toLowerCase().endsWith('.svg'))
const cappedWidth = computed(() => {
  if (props.width) return props.width
  const naturalWidth = props.src ? config.public.imageWidths[props.src] : undefined
  return naturalWidth ? Math.min(naturalWidth, 1280) : 1280
})
</script>

<template>
  <img
    v-if="isSvg"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
  >
  <NuxtImg
    v-else
    :src="src"
    :alt="alt"
    :width="cappedWidth"
    :height="height"
    format="webp"
    quality="100"
  />
</template>
