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
    permissions: ['storage', 'notifications'],
    host_permissions: ['http://*/*', 'https://*/*'],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
    },
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '128': 'icon/128.png'
      }
    },
    background: {
      service_worker: 'background.js',
      type: 'module'
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png'
    }
  }
});
