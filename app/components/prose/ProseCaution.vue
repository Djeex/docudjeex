<script setup lang="ts">
import { useAppConfig } from '#imports'
import Callout from '#ui/components/prose/Callout.vue'

// Set `::caution{icon=""}` in the markdown to hide the default icon for
// that one instance (useful when the body already starts with its own
// emoji).
const props = withDefaults(defineProps<{ icon?: string }>(), {
  icon: undefined,
})
const appConfig = useAppConfig()
const icon = computed(() => props.icon !== undefined ? props.icon : appConfig.ui.icons.caution)
</script>

<template>
  <Callout
    color="error"
    :icon="icon"
  >
    <slot mdc-unwrap="p" />
  </Callout>
</template>
