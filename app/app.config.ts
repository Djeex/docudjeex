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
      pre: {
        slots: {
          base: 'bg-[#121110] border-[#201e1b] rounded-lg',
          header: 'bg-[#121110] border-[#201e1b]',
        },
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
