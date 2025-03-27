import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { addCopyButton } from 'shiki-transformer-copy-button';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
  site: 'https://blog.deanlofts.xyz',
  integrations: [mdx(), sitemap(), react()],
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
      type: 'shiki',
      excludeLangs: ['mermaid']
    },
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: 'img-svg',
          dark: true,
          mermaidConfig: {
            securityLevel: 'loose',
            sequence: {
              showSequenceNumbers: true,
              actorMargin: 50,
              boxMargin: 10,
              messageMargin: 35,
              mirrorActors: true
            }
          },
          errorFallback: (element, diagram, error) => {
            console.error('Mermaid diagram error:', error);
            return {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['mermaid-error'],
                style: 'padding: 1rem; background: #fee2e2; border: 1px solid #ef4444; border-radius: 0.375rem; color: #991b1b;'
              },
              children: [
                {
                  type: 'text',
                  value: 'Failed to render Mermaid diagram. Please check the syntax.'
                }
              ]
            };
          }
        }
      ]
    ]
  }
});