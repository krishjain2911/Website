import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://roundholesquarepeg.com',
  output: 'static',
  adapter: node({
    mode: 'standalone'
  }),
  security: {
    checkOrigin: false
  },
  redirects: {
    '/solutions': '/#solutions',
    '/solutions/voice-agents': '/solutions/sonakshi'
  },
  integrations: [sitemap()],
  compressHTML: true,
  devToolbar: {
    enabled: false
  },
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      modulePreload: {
        polyfill: false,
        resolveDependencies: (_url, deps) => {
          return deps.filter((dep) => !dep.includes('Hero3D'));
        }
      }
    }
  }
});
