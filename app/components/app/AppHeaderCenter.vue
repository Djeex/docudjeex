<script setup lang="ts">
const { sections } = useSubNavigation()

const navMenuVariants = useUIConfig('navigationMenu')
</script>

<template>
  <template v-if="sections.length">
    <!-- Empty spacer: keeps the header's flex-1 center slot from collapsing
         while the real menu below is absolutely positioned so it can match
         the article's content-column width instead of this slot's width. -->
    <div class="hidden lg:block w-full" />

    <UContainer class="absolute inset-x-0 inset-y-0 hidden lg:flex items-center pointer-events-none">
      <!-- Mirrors the docs page's actual layout: an outer 10-col grid (left
           doc-tree sidebar = col-span-2) containing a second, nested 10-col
           grid for the article body (right TOC sidebar = col-span-2 of that
           inner grid). Matching both levels is what lines this menu up with
           the real content column instead of a naive single-level fraction. -->
      <div class="grid grid-cols-10 gap-10 w-full pointer-events-auto">
        <div class="col-span-8 col-start-3 grid grid-cols-10 gap-10">
          <div class="col-span-8 col-start-1">
            <UNavigationMenu
              :items="sections"
              :highlight="navMenuVariants.highlight ?? true"
              :highlight-color="navMenuVariants.highlightColor"
              :variant="navMenuVariants.variant ?? 'pill'"
              :color="navMenuVariants.color"
              class="-mx-[10px] w-[calc(100%+20px)] [&>div]:w-full"
              :ui="{ list: 'w-full justify-between', item: 'py-0' }"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </template>

  <UContentSearchButton
    v-else
    :collapsed="false"
    class="w-full"
    variant="soft"
    :ui="{
      leadingIcon: 'size-4 mx-0.5',
    }"
  />
</template>
