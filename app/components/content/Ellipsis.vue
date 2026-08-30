<script setup lang="ts">
withDefaults(defineProps<{
  width?: string
  height?: string
  zIndex?: string
  top?: string
  left?: string
  right?: string
  blur?: string
  colors?: string[]
}>(), {
  width: '10rem',
  height: '10rem',
  zIndex: '10',
  top: '0',
  left: 'auto',
  right: 'auto',
  blur: '50px',
  colors: () => ['rgba(0, 71, 225, 0.34)', 'rgba(26, 214, 255, 0.22)', 'rgba(0, 71, 225, 0.22)'],
})
</script>

<template>
  <div
    class="pointer-events-none absolute w-full"
    :style="{
      top,
      insetInlineStart: left,
      insetInlineEnd: right,
      zIndex,
      maxWidth: width,
      height,
      filter: `blur(${blur})`,
    }"
  >
    <div
      class="w-full h-full"
      :style="{
        background: `linear-gradient(97.62deg, ${colors[0]} 2.27%, ${colors[1]} 65%, ${colors[2]} 98.48%)`,
      }"
    />
  </div>
</template>
