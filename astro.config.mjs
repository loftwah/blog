// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://blog.deanlofts.xyz',
  integrations: [
    mdx(), 
    sitemap(), 
    react(),
    tailwind(), // Add Tailwind integration
  ],
});