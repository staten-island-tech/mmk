// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@comark/nuxt",
  ],
  css: [
    "@fontsource/pixelify-sans/400.css",
    "@fontsource/pixelify-sans/500.css",
    "@fontsource/pixelify-sans/600.css",
    "@fontsource/pixelify-sans/700.css",
    "@fontsource/rajdhani/400.css",
    "@fontsource/rajdhani/500.css",
    "@fontsource/rajdhani/600.css",
    "@fontsource/rajdhani/700.css",
  ],
  supabase: {
    types: "./app/types/database.types.ts",
    redirectOptions: {
      login: "/login",
      callback: "/",
      include: undefined,
      exclude: ["/register", "/privacy"],
      saveRedirectToCookie: false,
    },
  },
  runtimeConfig: {
    supabaseSecretKey: "",
    public: {
      authEmailDomain: "",
      mmkPanelApi: "",
    },
  },
  vite: {
    vue: {
      script: {
        babelParserPlugins: [],
      },
    },
  },
  app: {
    pageTransition: { name: "default", mode: "out-in" },
  },
});