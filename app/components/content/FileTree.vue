<script setup lang="ts">
export type FileTreeEntry = string | Record<string, FileTreeEntry[]>

const props = withDefaults(defineProps<{
  tree: FileTreeEntry
  label?: string
  collapsed?: boolean
}>(), {
  label: 'Folder structure',
  collapsed: false,
})

// `collapsed` only sets the initial state; the header click below then
// toggles this independently of the prop.
const isOpen = ref(!props.collapsed)
</script>

<template>
  <div class="not-prose my-5 rounded-lg overflow-hidden bg-elevated/50 ring ring-default divide-y divide-default">
    <button
      type="button"
      class="flex items-center gap-1.5 w-full px-4 py-3 text-muted hover:text-default hover:bg-elevated/50 transition-colors cursor-pointer"
      @click="isOpen = !isOpen"
    >
      <UIcon name="i-lucide-folder-tree" class="size-4 shrink-0" />
      <span class="text-sm/6">{{ label }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 shrink-0 ms-auto transition-transform"
        :class="isOpen ? '' : '-rotate-90'"
      />
    </button>
    <ul v-show="isOpen" class="text-sm leading-relaxed px-2 py-2 list-none">
      <FileTreeNode :entry="tree" root />
    </ul>
  </div>
</template>
