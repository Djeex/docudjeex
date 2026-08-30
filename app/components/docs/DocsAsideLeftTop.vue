<script setup lang="ts">
const { subNavigationMode, sections } = useSubNavigation()
</script>

<template>
  <div
    v-if="subNavigationMode === 'aside'"
    class="mb-2"
  >
    <UPageAnchors :links="sections" />
    <USeparator
      type="dashed"
      class="my-4"
    />
  </div>

  <div
    v-else
    class="mb-4"
  >
    <UContentSearchButton
      :collapsed="false"
      class="w-full"
      variant="soft"
      :ui="{
        leadingIcon: 'size-4 mx-0.5',
      }"
    />
  </div>
</template>
