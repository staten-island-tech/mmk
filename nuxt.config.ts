// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "@nuxt/icon",
  ],
  css: [
    "@fontsource/pixelify-sans/400.css",
    "@fontsource/pixelify-sans/500.css",
    "@fontsource/pixelify-sans/600.css",
    "@fontsource/pixelify-sans/700.css",
  ],
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ["/register"],
      saveRedirectToCookie: false,
    },
  },
  runtimeConfig: {
    public: {
      authEmailDomain: "",
    },
  },
  vite: {
    vue: {
      script: {
        babelParserPlugins: [],
      },
    },
  },
});
