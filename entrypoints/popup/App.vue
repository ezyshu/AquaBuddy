<template>
  <div class="aqua-buddy-container">
    <div class="header">
      <h1>AquaBuddy</h1>
      <div class="subtitle">今天喝水了吗？</div>
      <button class="settings-button" @click="openSettings" title="设置">
        ⚙️
      </button>
    </div>
    
    <div class="water-progress">
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }">
          <div class="water-wave"></div>
        </div>
        <div class="water-droplet" v-for="i in totalCups" :key="i" 
             :class="{ 'filled': i <= drankCups }">
          💧
        </div>
      </div>
      <div class="progress-text">{{ drankCups }} / {{ totalCups }} 杯</div>
    </div>
    
    <div class="water-action">
      <button class="drink-button" @click="drinkWater" :disabled="drankCups >= totalCups">
        <span class="button-icon">🥤</span>
        <span>喝一杯水</span>
      </button>
    </div>
    
    <div class="water-mascot" :class="{ 'happy': progressPercentage >= 100 }">
      <div class="mascot-image">{{ progressPercentage >= 100 ? '🐳' : '🐟' }}</div>
      <div class="mascot-speech">
        {{ mascotMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      drankCups: 0,
      totalCups: 8,
      lastUpdatedDate: '',
      messages: {
        start: ['该喝水啦！', '记得补充水分哦！', '健康从喝水开始～'],
        progress: ['继续加油！', '喝水进行中...', '你做得很棒！'],
        complete: ['今日目标达成！', '完美完成！', '好样的！']
      }
    }
  },
  computed: {
    progressPercentage() {
      return Math.min(100, (this.drankCups / this.totalCups) * 100);
    },
    mascotMessage() {
      if (this.drankCups === 0) {
        return this.getRandomMessage('start');
      } else if (this.drankCups >= this.totalCups) {
        return this.getRandomMessage('complete');
      } else {
        return this.getRandomMessage('progress');
      }
    }
  },
  methods: {
    drinkWater() {
      if (this.drankCups < this.totalCups) {
        this.drankCups++;
        this.saveData();
      }
    },
    getRandomMessage(type) {
      const messages = this.messages[type];
      return messages[Math.floor(Math.random() * messages.length)];
    },
    saveData() {
      const today = new Date().toISOString().split('T')[0];
      chrome.storage.local.set({
        aquaBuddy: {
          drankCups: this.drankCups,
          totalCups: this.totalCups,
          lastUpdatedDate: today
        }
      });
    },
    loadData() {
      chrome.storage.local.get('aquaBuddy', (result) => {
        if (result.aquaBuddy) {
          const today = new Date().toISOString().split('T')[0];
          
          // 如果是新的一天，重置喝水计数
          if (result.aquaBuddy.lastUpdatedDate !== today) {
            this.drankCups = 0;
            this.lastUpdatedDate = today;
          } else {
            this.drankCups = result.aquaBuddy.drankCups || 0;
            this.lastUpdatedDate = result.aquaBuddy.lastUpdatedDate;
          }
          
          this.totalCups = result.aquaBuddy.totalCups || 8;
        }
      });
    },
    openSettings() {
      // 打开设置页面
      chrome.runtime.sendMessage({ action: 'open_options_page' });
    }
  },
  mounted() {
    this.loadData();
  }
}
</script>

<style>
.aqua-buddy-container {
  width: 300px;
  padding: 16px;
  font-family: 'Comic Sans MS', 'Marker Felt', sans-serif;
  background-color: #e6f7ff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 16px;
  position: relative;
}

.header h1 {
  margin: 0;
  margin-bottom: 10px;
  color: #0099cc;
  font-size: 24px;
}

.subtitle {
  color: #66b3cc;
  font-size: 14px;
}

.settings-button {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.settings-button:hover {
  background-color: rgba(0, 153, 204, 0.1);
  transform: rotate(30deg);
}

.water-progress {
  margin-bottom: 20px;
}

.progress-container {
  height: 20px;
  background-color: #d9f2ff;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background-color: #33ccff;
  border-radius: 10px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.water-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: wave 2s infinite linear;
}

@keyframes wave {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0%); }
}

.water-droplet {
  position: absolute;
  top: 0;
  font-size: 14px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.water-droplet.filled {
  opacity: 1;
}

.progress-text {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #0099cc;
}

.water-action {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.drink-button {
  background-color: #33ccff;
  border: none;
  border-radius: 20px;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 153, 204, 0.2);
}

.drink-button:hover {
  background-color: #00b3e6;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 153, 204, 0.3);
}

.drink-button:disabled {
  background-color: #b3e6ff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-icon {
  margin-right: 8px;
  font-size: 20px;
}

.water-mascot {
  display: flex;
  align-items: center;
  background-color: #d9f2ff;
  border-radius: 10px;
  padding: 10px;
  margin-top: 20px;
}

.mascot-image {
  font-size: 32px;
  margin-right: 10px;
  transition: transform 0.5s ease;
}

.water-mascot.happy .mascot-image {
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

.mascot-speech {
  background-color: white;
  border-radius: 10px;
  padding: 8px 12px;
  position: relative;
  flex: 1;
}

.mascot-speech:before {
  content: "";
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 10px 8px 0;
  border-style: solid;
  border-color: transparent white transparent transparent;
}
</style>