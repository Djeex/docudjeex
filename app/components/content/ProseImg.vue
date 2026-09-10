<script setup lang="ts">
// Overrides Nuxt Content's default ProseImg (which renders every markdown
// image as a plain <img>, or through NuxtImg only if it happens to detect
// one registered): every raster image gets capped at 1280px wide (IPX
// never upscales past its native size by default) and re-encoded to WebP,
// which alone cuts most screenshots down substantially. SVGs are already
// tiny vector files and would gain nothing from either step, so they're
// left untouched.
const props = defineProps<{
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
}>()

const isSvg = computed(() => props.src?.toLowerCase().endsWith('.svg'))
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
    :width="width ?? 1280"
    :height="height"
    format="webp"
    quality="100"
  />
</template>
