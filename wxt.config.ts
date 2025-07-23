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
    description: '可爱风格喝水小助手，助你养成健康饮水习惯。',
    permissions: ['storage'],
    host_permissions: ['http://*/*', 'https://*/*'],
  }
});
