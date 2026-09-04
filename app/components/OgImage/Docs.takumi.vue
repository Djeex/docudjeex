<script lang="ts" setup>
const { title, description, headline } = defineProps<{ title?: string, description?: string, headline?: string }>()

const appConfig = useAppConfig()
const { name: siteName } = useSiteConfig()
const primaryColor = appConfig.ui?.colors?.primary ?? 'emerald'
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-[#0B0A0A] px-[80px] py-[60px]">
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
      <div class="text-white text-[18px] font-normal rounded-lg px-5 py-2">
        {{ siteName }}
      </div>
    </div>
  </div>
</template>
