import { defineConfig } from "astro/config";
import icon from "astro-icon";
import netlify from "@astrojs/netlify";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  integrations: [icon(), vue()],
  output: "server",
  adapter: netlify()
});