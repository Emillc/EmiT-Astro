import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  integrations: [
    icon(),
    unocss(),
  ],
})
