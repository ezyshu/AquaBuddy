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
export default {
  data() {
    return {
      waterGoal: 8,
      drankCups: 0,
      settingsSaved: false
    }
  },
  methods: {
    loadSettings() {
      const browserAPI = chrome;
      
      browserAPI.storage.local.get('aquaBuddy', (result) => {
        if (result.aquaBuddy) {
          this.waterGoal = result.aquaBuddy.totalCups || 8;
          this.drankCups = result.aquaBuddy.drankCups || 0;
        }
      });
    },
    saveSettings() {
      const browserAPI = chrome;
      
      // 保存喝水目标
      browserAPI.storage.local.get('aquaBuddy', (result) => {
        const aquaBuddyData = result.aquaBuddy || {};
        aquaBuddyData.totalCups = this.waterGoal;
        
        browserAPI.storage.local.set({ aquaBuddy: aquaBuddyData });
      });
      
      // 显示保存成功动画
      this.settingsSaved = true;
      setTimeout(() => {
        this.settingsSaved = false;
      }, 2000);
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
    }
  },
  mounted() {
    this.loadSettings();
  }
}
</script>

<style>
.aqua-buddy-options {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Comic Sans MS', 'Marker Felt', sans-serif;
  background-color: #f0f9ff;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 48px;
  margin-right: 15px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.header h1 {
  margin: 0;
  color: #0099cc;
  font-size: 28px;
}

.settings-container {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h2 {
  color: #0099cc;
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px dashed #b3e6ff;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 10px;
}

.setting-label {
  font-weight: bold;
  color: #333;
}

.setting-control {
  display: flex;
  align-items: center;
}

/* Cup adjuster styling */
.cup-adjuster {
  display: flex;
  align-items: center;
}

.cup-adjuster button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background-color: #33ccff;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.cup-adjuster button:hover {
  background-color: #00b3e6;
}

.cup-adjuster button:disabled {
  background-color: #b3e6ff;
  cursor: not-allowed;
}

.cup-adjuster span {
  margin: 0 15px;
  font-weight: bold;
  font-size: 18px;
  color: #0099cc;
}

/* Current cups display */
.current-cups {
  font-weight: bold;
  font-size: 18px;
  color: #0099cc;
  margin-right: 15px;
}

/* Reset button styling */
.reset-button {
  background-color: #ff9999;
  border: none;
  border-radius: 10px;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #ff6666;
}

/* Save button styling */
.settings-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.save-button {
  background-color: #33ccff;
  border: none;
  border-radius: 20px;
  color: white;
  padding: 10px 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 153, 204, 0.2);
}

.save-button:hover {
  background-color: #00b3e6;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 153, 204, 0.3);
}

/* Mascot footer styling */
.mascot-footer {
  display: flex;
  align-items: center;
  margin-top: 30px;
  background-color: #e6f7ff;
  border-radius: 15px;
  padding: 15px;
}

.mascot-image {
  font-size: 40px;
  margin-right: 15px;
  transition: transform 0.5s ease;
}

.mascot-image.happy {
  animation: jump 1s infinite alternate;
}

@keyframes jump {
  0% { transform: translateY(0); }
  100% { transform: translateY(-15px) rotate(10deg); }
}

.mascot-speech {
  background-color: white;
  border-radius: 15px;
  padding: 10px 15px;
  position: relative;
  flex: 1;
  font-size: 16px;
  color: #0099cc;
}

.mascot-speech:before {
  content: "";
  position: absolute;
  left: -15px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 10px 15px 10px 0;
  border-style: solid;
  border-color: transparent white transparent transparent;
}
</style>