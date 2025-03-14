// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  css: [
    '@/assets/css/main.css'
  ],
  app: {
    head: {
      title: 'Student Progress Tracker',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Student Progress Tracker App' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  nitro: {
    preset: 'node-server',
    routeRules: {
      '/**': { cache: { maxAge: 0 } }
    },
    timing: false
  },
  runtimeConfig: {
    public: {
      // Public runtime configuration
    }
  },
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.includes('-')
    }
  },
  build: {
    transpile: []
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  ssr: true,
  experimental: {
    payloadExtraction: false,
    componentIslands: true
  }
}) 