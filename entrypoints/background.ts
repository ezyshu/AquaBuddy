export default defineBackground(() => {
  console.log('AquaBuddy background service started!', { id: browser.runtime.id });
});

const browserAPI = (typeof browser !== 'undefined' ? browser : chrome);

// 处理喝水记录更新
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateWaterRecord') {
    // 可以在这里添加额外的处理逻辑
    sendResponse({ success: true });
  }
});

// 进入 options 分享页面
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'open_options_page') {
    const extensionURL = browserAPI.runtime.getURL('options.html');
    browserAPI.tabs.create({ url: extensionURL });
  }
});