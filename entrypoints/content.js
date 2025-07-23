import './app.less';

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: 'ui',

  async main(ctx) {
  }
});
