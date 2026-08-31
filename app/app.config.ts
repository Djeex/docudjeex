export default defineAppConfig({
  docus: {
    locale: 'en',
    colorMode: 'dark',
  },
  navigation: {
    sub: 'header',
  },
  header: {
    title: 'Docudjeex',
    logo: {
      light: '/img/logo.svg',
      dark: '/img/logo.svg',
      alt: 'Docudjeex',
    },
  },
  socials: {
    gitea: 'https://git.djeex.fr/Djeex/docudjeex',
  },
  github: {
    url: 'https://github.com/Djeex/docudjeex',
  },
  ui: {
    colors: {
      primary: 'cyan',
      neutral: 'zinc',
    },
    prose: {
      card: {
        slots: {
          base: 'bg-[rgba(12,13,12,0.8)] border-[#121110]',
        },
      },
      // Custom code-block header icons, keyed by lowercase `[label]` text
      // (see ```text [Arborescence] / ```text [Directory tree] blocks).
      codeIcon: {
        'arborescence': 'i-lucide-folder-tree',
        'directory tree': 'i-lucide-folder-tree',
      },
      pre: {
        slots: {
          base: 'bg-[#121110] border-[#201e1b] rounded-lg',
          header: 'bg-[#121110] border-[#201e1b]',
        },
      },
      // Exact colors measured on the old site's ::alert boxes (note=info,
      // tip=success, warning=warning, caution=danger/error).
      callout: {
        compoundVariants: [
          {
            color: 'info',
            class: {
              base: 'border-[#002235] bg-[#00131D] text-[#64C7FF]',
              icon: 'text-[#64C7FF]',
            },
          },
          {
            color: 'success',
            class: {
              base: 'border-[#002817] bg-[#00190F] text-[#3CEEA5]',
              icon: 'text-[#3CEEA5]',
            },
          },
          {
            color: 'warning',
            class: {
              base: 'border-[#292100] bg-[#1B1500] text-[#FFDC4E]',
              icon: 'text-[#FFDC4E]',
            },
          },
          {
            color: 'error',
            class: {
              base: 'border-[#340A01] bg-[#1C0301] text-[#FFA692]',
              icon: 'text-[#FFA692]',
            },
          },
        ],
      },
    },
    header: {
      slots: {
        root: 'bg-[rgba(12,13,12,0.8)] backdrop-blur-[20px] backdrop-saturate-200 border-b border-default h-(--ui-header-height) sticky top-0 z-50',
      },
    },
    contentSearchButton: {
      slots: {
        base: 'bg-[rgba(12,13,12,0.8)] hover:bg-[rgba(18,17,16,0.9)] border border-[#121110]',
      },
    },
    contentSurround: {
      slots: {
        link: 'bg-[rgba(12,13,12,0.8)] border-[#121110] hover:bg-primary/10 hover:border-primary',
        linkLeading: 'bg-[rgba(12,13,12,0.8)] ring-1 ring-[var(--ui-text-highlighted)]/50 group-hover:bg-primary/10 group-hover:ring-primary/50',
      },
    },
    kbd: {
      compoundVariants: [
        {
          color: 'neutral',
          variant: 'subtle',
          class: 'ring-[#121110] bg-[rgba(12,13,12,0.8)] text-default',
        },
      ],
    },
  },
})
