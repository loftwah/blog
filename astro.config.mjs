// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

export default defineConfig({
  site: 'https://blog.deanlofts.xyz',
  integrations: [
    mdx(), 
    sitemap(),
    compress()  // for optimizing performance
  ],
  build: {
    format: 'directory'  // Required for GitHub Pages
  },
  output: 'static', // Make sure the site builds as static for GitHub Pages
  trailingSlash: 'always', // Use trailing slash to avoid issues with directories
});
