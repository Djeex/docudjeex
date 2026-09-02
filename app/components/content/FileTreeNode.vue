<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import codeIconTheme from '#build/ui/prose/code-icon'
import type { FileTreeEntry } from './FileTree.vue'

const props = withDefaults(defineProps<{
  entry: FileTreeEntry
  root?: boolean
  parentPath?: string
}>(), {
  root: false,
  parentPath: '',
})

// Splits a trailing " # comment" off a raw label (space-prefixed, like a
// real code comment), so authors can annotate a tree entry the same way
// they'd annotate a line of code.
function splitComment(raw: string) {
  const index = raw.indexOf(' #')
  if (index === -1) return { text: raw, comment: undefined as string | undefined }
  return { text: raw.slice(0, index).trimEnd(), comment: raw.slice(index + 2).trim() }
}

const rawEntry = computed(() => typeof props.entry === 'object' ? Object.keys(props.entry)[0] : props.entry as string)
const parsed = computed(() => splitComment(rawEntry.value))

const isFolder = computed(() => typeof props.entry === 'object' || parsed.value.text.endsWith('/'))

// Strip a trailing "/" marker, except when it's the whole name: that's the
// filesystem root itself, written as a bare "/".
const name = computed(() => {
  const text = parsed.value.text
  return text.length > 1 && text.endsWith('/') ? text.slice(0, -1) : text
})
const comment = computed(() => parsed.value.comment)

const children = computed<FileTreeEntry[]>(() => {
  if (typeof props.entry !== 'object') return []
  return Object.values(props.entry)[0] || []
})

// The root's own name is "/" already; every other node just appends its
// name to its parent's path, without doubling that leading slash.
const fullPath = computed(() => {
  if (props.root) return name.value
  return props.parentPath === '/' ? `/${name.value}` : `${props.parentPath}/${name.value}`
})

const { copy, copied } = useClipboard({ source: fullPath })

function onClick() {
  copy()
}

const appConfig = useAppConfig()

// Same lookup order as Nuxt UI's own CodeIcon.vue (exact filename match,
// then extension, then the vscode-icons fallback), so a file gets the same
// icon here as it would in a labeled code fence.
const icon = computed(() => {
  if (isFolder.value) return 'i-lucide-folder'

  const filename = name.value
  const icons = { ...codeIconTheme, ...(appConfig.ui?.prose?.codeIcon || {}) } as Record<string, string>
  const extension = filename.includes('.') ? filename.split('.').pop() : undefined

  return icons[filename.toLowerCase()]
    ?? (extension && icons[extension])
    ?? (extension && `i-vscode-icons-file-type-${extension}`)
    ?? 'i-lucide-file'
})
</script>

<template>
  <li class="relative" :class="root ? '' : 'ps-3'">
    <span
      class="group flex items-center gap-1.5 py-1 px-1.5 -mx-1.5 rounded-md relative hover:bg-elevated/50 transition-colors cursor-pointer"
      title="Copy path"
      @click="onClick"
    >
      <span
        v-if="!root"
        class="absolute -start-1.5 top-1/2 -translate-y-1/2 w-3 h-px bg-white/20"
      />
      <UIcon
        :name="icon"
        class="shrink-0 size-4"
        :class="isFolder ? 'text-[var(--ui-primary)]' : 'text-[var(--ui-text-dimmed)]'"
      />
      <span>{{ name }}</span>
      <span v-if="comment" class="text-xs text-muted italic">{{ comment }}</span>
      <UIcon
        :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        class="size-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted"
      />
    </span>
    <ul v-if="children.length" class="ms-2 ps-0 list-none border-s border-white/20">
      <FileTreeNode v-for="(child, i) in children" :key="i" :entry="child" :parent-path="fullPath" />
    </ul>
  </li>
</template>
