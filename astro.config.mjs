import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { addCopyButton } from 'shiki-transformer-copy-button';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
  site: 'https://blog.deanlofts.xyz',
  integrations: [
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
      ],
    },
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid']
    },
    rehypePlugins: [[rehypeMermaid, {
      strategy: 'img-svg',
      mermaidConfig: {
        theme: 'base',
        themeVariables: {
          primaryColor: '#0366d6',
          primaryTextColor: '#24292e',
          primaryBorderColor: '#e1e4e8',
          lineColor: '#24292e',
          secondaryColor: '#6a737d',
          tertiaryColor: '#959da5',
          background: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }
      }
    }]]
  },
});
