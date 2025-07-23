import { defineConfig } from 'wxt';
import pkg from './package.json';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'arcoblue-6': '#2C3E50',
          },
        },
      },
    },
  }),
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'AquaBuddy - 喝水小助手',
    version: pkg.version,
    description: 'Cute-style water drinking reminder assistant, helping you develop healthy drinking habits.',
    permissions: ['storage', 'tabs'],
    host_permissions: ['http://*/*', 'https://*/*'],
  }
});
