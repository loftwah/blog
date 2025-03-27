import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { addCopyButton } from 'shiki-transformer-copy-button';
import d2 from 'astro-d2';

export default defineConfig({
  site: 'https://blog.deanlofts.xyz',
  integrations: [
    d2({output: "d2"}),
    mdx(), 
    sitemap(), 
    react()
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    shikiConfig: {
      theme: 'material-theme',
      transformers: [
        addCopyButton({ toggle: 2000 }),
        {
          pre(node) {
            node.properties.className = [...(node.properties.className || []), 'custom-shiki'];
            return node;
          }
        }
      ]
    },
    syntaxHighlight: {
      type: 'shiki'
    }
  }
});