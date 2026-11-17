import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://roundholesquarepeg.com',
  output: 'static',
  redirects: {
    '/solutions': '/#solutions',
    '/solutions/voice-agents': '/solutions/sonakshi'
  },
  integrations: [],
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
