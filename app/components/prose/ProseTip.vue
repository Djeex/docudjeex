<script setup lang="ts">
import { useAppConfig } from '#imports'
import Callout from '#ui/components/prose/Callout.vue'

// Set `::tip{icon=""}` in the markdown to hide the default icon for that
// one instance (useful when the body already starts with its own emoji).
const props = withDefaults(defineProps<{ icon?: string }>(), {
  icon: undefined,
})
const appConfig = useAppConfig()
const icon = computed(() => props.icon !== undefined ? props.icon : appConfig.ui.icons.tip)
</script>

<template>
  <Callout
    color="success"
    :icon="icon"
  >
    <slot mdc-unwrap="p" />
  </Callout>
</template>
