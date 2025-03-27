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
      dark: true,
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
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          darkMode: true,
          darkPrimaryColor: '#58a6ff',
          darkPrimaryTextColor: '#c9d1d9',
          darkPrimaryBorderColor: '#30363d',
          darkLineColor: '#c9d1d9',
          darkSecondaryColor: '#8b949e',
          darkTertiaryColor: '#8b949e',
          darkBackground: '#0d1117',
        },
        securityLevel: 'loose',
        flowchart: {
          curve: 'basis',
          padding: 20,
          htmlLabels: true,
          defaultRenderer: 'elk',
        },
        sequence: {
          showSequenceNumbers: true,
          actorMargin: 50,
          boxMargin: 10,
          messageMargin: 35,
          mirrorActors: true,
        },
        gantt: {
          titleTopMargin: 25,
          barHeight: 20,
          barGap: 4,
          topPadding: 50,
          leftPadding: 75,
          gridLineStartPadding: 35,
          fontSize: 11,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          numberSectionStyles: 4,
          axisFormat: '%Y-%m-%d',
          topAxis: true,
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
    }]]
  },
});
