import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://roundholesquarepeg.com',
  output: 'static',
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
