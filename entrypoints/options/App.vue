<template>
  <div class="aqua-buddy-options">
    <div class="header">
      <div class="logo">🐳</div>
      <h1>AquaBuddy 设置</h1>
    </div>
    
    <div class="settings-container">
      <div class="settings-section">
        <h2>喝水目标</h2>
        
        <div class="setting-item">
          <div class="setting-label">每日目标杯数</div>
          <div class="setting-control">
            <div class="cup-adjuster">
              <button @click="decreaseCups" :disabled="waterGoal <= 1">-</button>
              <span>{{ waterGoal }}</span>
              <button @click="increaseCups">+</button>
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">今日已喝水杯数</div>
          <div class="setting-control">
            <div class="current-cups">{{ drankCups }} / {{ waterGoal }}</div>
            <button class="reset-button" @click="resetToday">重置今日记录</button>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h2>通知设置</h2>
        
        <div class="setting-item">
          <div class="setting-label">定时提醒</div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="reminderEnabled">
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label" :class="{ 'enabled': reminderEnabled }">{{ reminderEnabled ? '已开启' : '已关闭' }}</span>
          </div>
        </div>
        
        <div class="setting-group" v-if="reminderEnabled">
          <div class="setting-item">
            <div class="setting-label">提醒间隔</div>
            <div class="setting-control">
              <div class="reminder-interval">
                <select class="interval-select" v-model="reminderInterval" @change="handleIntervalChange">
                  <option value="30">30 分钟</option>
                  <option value="60">1 小时</option>
                  <option value="90">1.5 小时</option>
                  <option value="120">2 小时</option>
                  <option value="180">3 小时</option>
                  <option value="240">4 小时</option>
                  <option value="300">5 小时</option>
                  <option value="360">6 小时</option>
                  <option value="custom">自定义...</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="setting-item" v-if="reminderInterval === 'custom'">
            <div class="setting-label">自定义间隔（分钟）</div>
            <div class="setting-control">
              <div class="custom-interval">
                <input 
                  type="number" 
                  class="interval-input" 
                  v-model.number="customIntervalMinutes" 
                  min="1" 
                  max="480"
                  step="1"
                  @input="validateCustomInterval"
                />
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">提醒时间范围</div>
            <div class="setting-control">
              <div class="time-range">
                <custom-time-picker v-model="reminderStartTime" />
                <span class="time-range-label">至</span>
                <custom-time-picker v-model="reminderEndTime" />
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">工作日提醒</div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input type="checkbox" v-model="workdaysOnly">
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label" :class="{ 'enabled': workdaysOnly }">{{ workdaysOnly ? '仅工作日' : '每天' }}</span>
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">测试通知</div>
          <div class="setting-control">
            <button class="notification-button" @click="testNotification">发送测试通知</button>
          </div>
        </div>
        
        <div class="system-tips">
          <div class="tip-title">
            <span class="tip-icon">💡</span>
            通知无法显示？
          </div>
          <div class="tip-content">
            <p>Windows 系统设置可能禁用了 Chrome 的通知。</p>
            <p>请前往 <strong>Windows 设置 > 系统 > 通知与操作</strong> 中检查 Chrome 的通知权限。</p>
          </div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="save-button" @click="saveSettings">保存设置</button>
      </div>
    </div>
    
    <div class="mascot-footer">
      <div class="mascot-image" :class="{ 'happy': settingsSaved }">
        {{ settingsSaved ? '🐳' : '🐟' }}
      </div>
      <div class="mascot-speech">
        {{ settingsSaved ? '设置已保存！' : '别忘了保存设置哦！' }}
      </div>
    </div>
  </div>
</template>

<script>
import './style.less';
import CustomTimePicker from './components/CustomTimePicker.vue';

export default {
  components: {
    CustomTimePicker
  },
  data() {
    return {
      waterGoal: 8,
      drankCups: 0,
      settingsSaved: false,
      reminderEnabled: false,
      reminderInterval: '60',
      customIntervalMinutes: 60,
      reminderStartTime: '09:00',
      reminderEndTime: '18:00',
      workdaysOnly: true
    }
  },
  methods: {
    loadSettings() {
      const browserAPI = chrome;
      
      browserAPI.storage.local.get('aquaBuddy', (result) => {
        if (result.aquaBuddy) {
          this.waterGoal = result.aquaBuddy.totalCups || 8;
          this.drankCups = result.aquaBuddy.drankCups || 0;
          this.reminderEnabled = result.aquaBuddy.reminderEnabled || false;
          
          // 处理提醒间隔
          if (result.aquaBuddy.customIntervalMinutes) {
            this.customIntervalMinutes = parseInt(result.aquaBuddy.customIntervalMinutes, 10);
            
            // 检查是否匹配预设值
            const presetValues = [1, 5, 10, 15, 30, 60, 90, 120, 180, 240, 300, 360];
            if (presetValues.includes(this.customIntervalMinutes)) {
              this.reminderInterval = this.customIntervalMinutes.toString();
            } else {
              this.reminderInterval = 'custom';
            }
          } else if (result.aquaBuddy.reminderInterval) {
            if (result.aquaBuddy.reminderInterval === 'custom') {
              this.reminderInterval = 'custom';
              const customValue = parseInt(result.aquaBuddy.customIntervalMinutes || '60', 10);
              this.customIntervalMinutes = isNaN(customValue) || customValue < 1 ? 60 : 
                                          customValue > 480 ? 480 : customValue;
            } else {
              this.reminderInterval = result.aquaBuddy.reminderInterval.toString();
              const intervalValue = parseInt(this.reminderInterval, 10);
              this.customIntervalMinutes = isNaN(intervalValue) || intervalValue < 1 ? 60 : 
                                          intervalValue > 480 ? 480 : intervalValue;
            }
          } else {
            this.reminderInterval = '60';
            this.customIntervalMinutes = 60;
          }
          
          this.reminderStartTime = result.aquaBuddy.reminderStartTime || '09:00';
          this.reminderEndTime = result.aquaBuddy.reminderEndTime || '18:00';
          this.workdaysOnly = result.aquaBuddy.workdaysOnly !== undefined ? result.aquaBuddy.workdaysOnly : true;
        }
      });
    },
    saveSettings() {
      const browserAPI = chrome;
      
      // 获取实际的提醒间隔（分钟）
      const actualInterval = this.reminderInterval === 'custom' 
        ? parseInt(this.customIntervalMinutes, 10) 
        : parseInt(this.reminderInterval, 10);
      
      console.log('保存设置 - 实际间隔:', actualInterval, '分钟');
      
      // 保存喝水目标和提醒设置
      browserAPI.storage.local.get('aquaBuddy', (result) => {
        const aquaBuddyData = result.aquaBuddy || {};
        aquaBuddyData.totalCups = this.waterGoal;
        aquaBuddyData.reminderEnabled = this.reminderEnabled;
        aquaBuddyData.reminderInterval = this.reminderInterval;
        aquaBuddyData.customIntervalMinutes = parseInt(this.customIntervalMinutes, 10);
        aquaBuddyData.reminderStartTime = this.reminderStartTime;
        aquaBuddyData.reminderEndTime = this.reminderEndTime;
        aquaBuddyData.workdaysOnly = this.workdaysOnly;
        
        browserAPI.storage.local.set({ aquaBuddy: aquaBuddyData });
        
        // 发送消息给背景脚本，更新提醒设置
        browserAPI.runtime.sendMessage({
          action: 'update_reminder_settings',
          enabled: this.reminderEnabled,
          interval: actualInterval,
          startTime: this.reminderStartTime,
          endTime: this.reminderEndTime,
          workdaysOnly: this.workdaysOnly
        }, (response) => {
          console.log('提醒设置更新响应:', response);
        });
      });
      
      // 显示保存成功动画
      this.settingsSaved = true;
      setTimeout(() => {
        this.settingsSaved = false;
      }, 2000);
    },
    handleIntervalChange() {
      console.log('间隔改变:', this.reminderInterval);
      // 如果选择了预设值，更新自定义分钟数
      if (this.reminderInterval !== 'custom') {
        this.customIntervalMinutes = parseInt(this.reminderInterval, 10);
      }
    },
    validateCustomInterval() {
      // 确保自定义间隔是数字且在有效范围内
      let value = parseInt(this.customIntervalMinutes, 10);
      
      if (isNaN(value) || value < 1) {
        value = 1;
      } else if (value > 480) {
        value = 480;
      }
      
      this.customIntervalMinutes = value;
    },
    increaseCups() {
      this.waterGoal++;
    },
    decreaseCups() {
      if (this.waterGoal > 1) {
        this.waterGoal--;
      }
    },
    resetToday() {
      const browserAPI = chrome;
      
      browserAPI.storage.local.get('aquaBuddy', (result) => {
        const aquaBuddyData = result.aquaBuddy || {};
        aquaBuddyData.drankCups = 0;
        
        browserAPI.storage.local.set({ aquaBuddy: aquaBuddyData }, () => {
          this.drankCups = 0;
          this.settingsSaved = true;
          setTimeout(() => {
            this.settingsSaved = false;
          }, 2000);
        });
      });
    },
    testNotification() {
      // 调用系统通知
      this.showSystemNotification('AquaBuddy 提醒', '该喝水啦！保持健康的饮水习惯 💧');
    },
    
    // 显示系统通知
    showSystemNotification(title, message) {
      const browserAPI = chrome;
      
      console.log('准备发送系统通知...');
      
      // 直接使用Chrome扩展API发送系统通知
      browserAPI.runtime.sendMessage({
        action: 'show_notification',
        title: title,
        message: message
      }, (response) => {
        console.log('收到通知响应:', response);
        if (response && response.success) {
          this.settingsSaved = true;
          setTimeout(() => {
            this.settingsSaved = false;
          }, 2000);
        } else if (browserAPI.runtime.lastError) {
          console.error('通知发送失败:', browserAPI.runtime.lastError);
          alert('通知发送失败: ' + JSON.stringify(browserAPI.runtime.lastError));
        } else {
          console.error('通知发送失败:', response);
          alert('通知发送失败，请检查浏览器通知权限设置');
        }
      });
    },
    
    // 以下方法不再使用
    showNotification(title, message) {
      this.showSystemNotification(title, message);
    },
    
    createNotification(title, message) {
      this.showSystemNotification(title, message);
    }
  },
  mounted() {
    this.loadSettings();
  }
}
</script>