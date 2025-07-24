export default defineBackground(() => {
  console.log('AquaBuddy background service started!', { id: browser.runtime.id });
  
  // 测试通知权限
  if ('chrome' in globalThis && chrome.notifications) {
    console.log('Chrome通知API可用');
    
    // 注册通知点击事件
    chrome.notifications.onClicked.addListener((notificationId) => {
      console.log('通知被点击:', notificationId);
      
      // 打开选项页面
      chrome.runtime.openOptionsPage();
      
      // 清除通知
      chrome.notifications.clear(notificationId);
    });
    
    // 尝试发送一个启动通知
    setTimeout(() => {
      console.log('尝试发送启动通知...');
      try {
        showSystemNotification('AquaBuddy已启动', '喝水小助手已准备就绪！');
      } catch (error) {
        console.error('创建启动通知时出现异常:', error);
      }
    }, 2000);
    
    // 加载提醒设置并启动定时器
    loadReminderSettings();
  } else {
    console.warn('Chrome通知API不可用');
  }
});

// 提醒设置
interface ReminderSettings {
  enabled: boolean;
  interval: number;
  startTime: string;
  endTime: string;
  workdaysOnly: boolean;
}

// 当前提醒设置
let currentSettings: ReminderSettings = {
  enabled: false,
  interval: 60,
  startTime: '09:00',
  endTime: '18:00',
  workdaysOnly: true
};

// 定时器ID
let reminderTimerId: number | null = null;

// 加载提醒设置
function loadReminderSettings() {
  chrome.storage.local.get('aquaBuddy', (result) => {
    if (result.aquaBuddy) {
      const { reminderEnabled, reminderInterval, customIntervalMinutes, reminderStartTime, reminderEndTime, workdaysOnly } = result.aquaBuddy;
      
      // 确定实际的提醒间隔（分钟）
      let actualInterval = 60;
      if (reminderInterval === 'custom' && customIntervalMinutes) {
        const parsedInterval = parseInt(customIntervalMinutes, 10);
        if (!isNaN(parsedInterval) && parsedInterval >= 1 && parsedInterval <= 480) {
          actualInterval = parsedInterval;
          console.log('加载自定义间隔:', actualInterval, '分钟');
        }
      } else if (typeof reminderInterval === 'string' && !isNaN(parseInt(reminderInterval, 10))) {
        const parsedInterval = parseInt(reminderInterval, 10);
        if (parsedInterval >= 1 && parsedInterval <= 480) {
          actualInterval = parsedInterval;
          console.log('加载预设间隔:', actualInterval, '分钟');
        }
      } else if (typeof reminderInterval === 'number' && !isNaN(reminderInterval) && reminderInterval >= 1 && reminderInterval <= 480) {
        actualInterval = reminderInterval;
        console.log('加载数字间隔:', actualInterval, '分钟');
      }
      
      currentSettings = {
        enabled: reminderEnabled || false,
        interval: actualInterval,
        startTime: reminderStartTime || '09:00',
        endTime: reminderEndTime || '18:00',
        workdaysOnly: workdaysOnly !== undefined ? workdaysOnly : true
      };
      
      console.log('已加载提醒设置:', currentSettings);
      
      if (currentSettings.enabled) {
        startReminderTimer(currentSettings);
      }
    }
  });
}

// 启动定时器
function startReminderTimer(settings: ReminderSettings) {
  // 清除现有定时器
  if (reminderTimerId !== null) {
    clearInterval(reminderTimerId);
    reminderTimerId = null;
    console.log('已清除现有定时器');
  }
  
  // 确保间隔是有效的数字
  const intervalMinutes = typeof settings.interval === 'number' && !isNaN(settings.interval) && settings.interval >= 1 && settings.interval <= 480
    ? settings.interval 
    : 60;
  
  // 转换为毫秒
  const intervalMs = intervalMinutes * 60 * 1000;
  
  console.log(`设置提醒间隔: ${intervalMinutes} 分钟 (${intervalMs} 毫秒)`);
  console.log(`提醒时间范围: ${settings.startTime} - ${settings.endTime}`);
  console.log(`工作日提醒: ${settings.workdaysOnly ? '是' : '否'}`);
  
  // 创建新定时器
  reminderTimerId = setInterval(() => {
    // 检查当前时间是否在允许的范围内
    if (isWithinTimeRange(settings) && isAllowedDay(settings)) {
      console.log(`触发定时提醒 (间隔: ${intervalMinutes} 分钟)`);
      showSystemNotification(
        '喝水提醒',
        '该喝水啦！保持健康的饮水习惯 💧'
      );
      
      // 更新喝水记录
      updateDrinkRecord();
    } else {
      console.log('当前时间不在提醒范围内，跳过提醒');
    }
  }, intervalMs) as unknown as number;
  
  console.log('定时器已启动，ID:', reminderTimerId);
}

// 检查当前时间是否在允许的时间范围内
function isWithinTimeRange(settings: ReminderSettings): boolean {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  
  // 解析开始和结束时间
  const [startHours, startMinutes] = settings.startTime.split(':').map(Number);
  const [endHours, endMinutes] = settings.endTime.split(':').map(Number);
  
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
}

// 检查当前是否是允许的日期（工作日/周末）
function isAllowedDay(settings: ReminderSettings): boolean {
  if (!settings.workdaysOnly) {
    return true; // 如果不限制工作日，则总是允许
  }
  
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 是周日，1-5 是周一到周五，6 是周六
  
  // 工作日是周一到周五 (1-5)
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

// 停止定时器
function stopReminderTimer() {
  if (reminderTimerId !== null) {
    clearInterval(reminderTimerId);
    reminderTimerId = null;
    console.log('已停止定时提醒');
  }
}

// 更新喝水记录
function updateDrinkRecord() {
  // 这里可以添加记录喝水次数的逻辑
  console.log('已记录一次喝水提醒');
}

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
    const extensionURL = browserAPI.runtime.getURL('/options.html');
    browserAPI.tabs.create({ url: extensionURL });
  }
});

// 处理更新提醒设置的请求
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'update_reminder_settings') {
    console.log('收到更新提醒设置请求:', request);
    
    const { enabled, interval, startTime, endTime, workdaysOnly } = request;
    
    // 确保间隔是有效的数字
    let actualInterval = 60;
    if (typeof interval === 'number' && !isNaN(interval) && interval >= 1 && interval <= 480) {
      actualInterval = interval;
      console.log('使用数字间隔:', actualInterval, '分钟');
    } else if (typeof interval === 'string' && !isNaN(parseInt(interval, 10))) {
      const parsedInterval = parseInt(interval, 10);
      if (parsedInterval >= 1 && parsedInterval <= 480) {
        actualInterval = parsedInterval;
        console.log('使用字符串间隔:', actualInterval, '分钟');
      }
    }
    
    // 更新当前设置
    currentSettings = {
      enabled,
      interval: actualInterval,
      startTime: startTime || '09:00',
      endTime: endTime || '18:00',
      workdaysOnly: workdaysOnly !== undefined ? workdaysOnly : true
    };
    
    console.log('已更新提醒设置:', currentSettings);
    
    if (enabled) {
      startReminderTimer(currentSettings);
    } else {
      stopReminderTimer();
    }
    
    sendResponse({ success: true, appliedInterval: actualInterval });
    return true; // 确保异步响应能够正常工作
  }
});

// 显示系统通知的函数
function showSystemNotification(title: string, message: string) {
  // 使用Chrome扩展API发送系统通知
  const options = {
    type: 'basic' as chrome.notifications.TemplateType,
    iconUrl: chrome.runtime.getURL('/icon/128.png'),
    title: title,
    message: message,
    priority: 2,
    requireInteraction: true,  // 通知会一直显示，直到用户交互
    silent: false  // 播放通知声音
  };
  
  console.log('创建系统通知:', options);
  
  // 生成唯一ID
  const notificationId = 'aquabuddy-' + Date.now();
  
  chrome.notifications.create(notificationId, options, (createdId) => {
    console.log('通知已创建，ID:', createdId);
    if (chrome.runtime.lastError) {
      console.error('创建通知时出错:', chrome.runtime.lastError);
    }
  });
  
  return true;
}

// 处理显示通知的请求
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  if (request.action === 'show_notification') {
    console.log('准备显示系统通知:', request.title, request.message);
    
    try {
      const result = showSystemNotification(request.title, request.message);
      sendResponse({ success: true, method: 'system_notification' });
    } catch (error: any) {
      console.error('创建系统通知时出现异常:', error);
      
      // 尝试使用备用方法 - 徽章通知
      try {
        if ('chrome' in globalThis && chrome.action) {
          chrome.action.setBadgeText({ text: '!' });
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
          sendResponse({ success: true, method: 'badge' });
        } else {
          sendResponse({ success: false, error: error.message });
        }
      } catch (badgeError) {
        sendResponse({ success: false, error: error.message, badgeError });
      }
    }
    
    // 确保异步回调能够正常工作
    return true;
  }
});