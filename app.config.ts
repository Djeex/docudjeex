// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  css: ['~/assets/css/extra.css'],
  colorMode: { 
    preference: 'dark',
    fallback:'dark',
    },
  content: {
     highlight: {
      langs: [
        'console',
        'nginx',
      ]
    }
  },

   mdc: {
     highlight: {
       theme: 'github-dark',
       langs: ['ts','console','nginx'],
       wrapperStyle: true
    }
   },
  
  docus: {
    title: 'Docudjeex',
    description: 'La doc de mes expériences',
    url: 'http://docus.dev',
    image: '/img/social.png',
    socials: {
      github:'',
      Language: {
        label: '🇫🇷',
        icon:'material-symbols:language-french', 
        href: 'https://docu.djeex.fr/fr/',
      },
      Gitea: {
        label: 'Gitea',
        icon: 'cib:gitea',
        href: 'https://git.djeex.fr/Djeex/docudjeex',
      },
      Github: {
        label: 'Github',
        icon:'cib:github', 
        href: 'https://github.com/Djeex',
      }
    },
    github: {
      baseUrl:'https://git.djeex.fr',
      dir: 'content',
      branch: 'src/branch/master',
      repo: 'docudjeex',
      owner: 'Djeex',
      edit: false
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: []
    },
    main: {
      padded: true,
      fluid: true
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: false
    },

    footer: {
      credits: {
        icon: '',
        text: '',
        href: '',
        }
    }

  },
})
