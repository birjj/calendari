import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import Icons from "unplugin-icons/vite";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  output: "server",
  adapter: netlify(),
  vite: {
    plugins: [
      Icons({
        compiler: "vue3",
      }),
    ],
  },
});
