import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { addCopyButton } from 'shiki-transformer-copy-button';

export default defineConfig({
  site: 'https://blog.deanlofts.xyz',
  integrations: [mdx(), sitemap(), react(), tailwind()],
  markdown: {
    shikiConfig: {
      theme: 'nord', // Use your preferred theme
      transformers: [addCopyButton({ toggle: 2000 })], // Add copy button with toggle option
    },
  },
});
