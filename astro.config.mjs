// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://loftwah.github.io/blog', // Adjust this to match your GitHub Pages URL
  integrations: [mdx(), sitemap()],
});
