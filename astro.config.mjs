// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://loftwah.github.io/blog',  // Make sure the site URL is correct for GitHub Pages
  base: '/blog/',  // This tells Astro to serve the site from the /blog subdirectory
  integrations: [mdx(), sitemap()],
});
