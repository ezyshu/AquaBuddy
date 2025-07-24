<template>
  <div class="custom-time-picker">
    <div class="time-display" :class="{ 'active': isOpen }" @click="toggleDropdown">
      <span>{{ displayValue }}</span>
      <span class="time-icon">🕒</span>
    </div>
    <div class="time-dropdown" :class="{ 'show': isOpen }">
      <div class="time-selectors">
        <div class="time-column">
          <div class="time-column-title">小时</div>
          <div class="time-scroll">
            <div 
              v-for="hour in hourOptions" 
              :key="'h-' + hour.value"
              class="time-option"
              :class="{ 'selected': hours === hour.value }"
              @click="selectHour(hour.value)"
            >
              {{ hour.display }}
            </div>
          </div>
        </div>
        <div class="time-column">
          <div class="time-column-title">分钟</div>
          <div class="time-scroll">
            <div 
              v-for="minute in minuteOptions" 
              :key="'m-' + minute.value"
              class="time-option"
              :class="{ 'selected': minutes === minute.value }"
              @click="selectMinute(minute.value)"
            >
              {{ minute.display }}
            </div>
          </div>
        </div>
      </div>
      <div class="time-period">
        <div 
          class="period-option" 
          :class="{ 'selected': period === 'AM' }"
          @click="selectPeriod('AM')"
        >
          上午
        </div>
        <div 
          class="period-option" 
          :class="{ 'selected': period === 'PM' }"
          @click="selectPeriod('PM')"
        >
          下午
        </div>
      </div>
      <div class="time-actions">
        <button class="time-action-btn time-cancel" @click="closeDropdown">取消</button>
        <button class="time-action-btn time-apply" @click="applyTime">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomTimePicker',
  props: {
    modelValue: {
      type: String,
      default: '08:00'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      hours: 8,
      minutes: 0,
      period: 'AM',
      displayValue: '08:00'
    }
  },
  computed: {
    hourOptions() {
      return Array.from({ length: 12 }, (_, i) => ({
        value: i === 0 ? 12 : i,
        display: i === 0 ? '12' : String(i).padStart(2, '0')
      }));
    },
    minuteOptions() {
      return Array.from({ length: 60 }, (_, i) => ({
        value: i,
        display: String(i).padStart(2, '0')
      }));
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.parseTime(this.modelValue);
      }
    },
    closeDropdown() {
      this.isOpen = false;
    },
    selectHour(hour) {
      this.hours = hour;
    },
    selectMinute(minute) {
      this.minutes = minute;
    },
    selectPeriod(period) {
      this.period = period;
    },
    applyTime() {
      const formattedHours = this.period === 'PM' && this.hours !== 12 
        ? this.hours + 12 
        : (this.period === 'AM' && this.hours === 12 ? 0 : this.hours);
      
      const timeString = `${String(formattedHours).padStart(2, '0')}:${String(this.minutes).padStart(2, '0')}`;
      this.$emit('update:modelValue', timeString);
      this.displayValue = this.formatDisplayTime(formattedHours, this.minutes);
      this.closeDropdown();
    },
    parseTime(timeString) {
      const [hoursStr, minutesStr] = timeString.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      // 转换为12小时制
      let period = 'AM';
      if (hours >= 12) {
        period = 'PM';
        if (hours > 12) {
          hours -= 12;
        }
      }
      if (hours === 0) {
        hours = 12;
      }
      
      this.hours = hours;
      this.minutes = minutes;
      this.period = period;
    },
    formatDisplayTime(hours24, minutes) {
      // 转换为12小时制显示
      let hours12 = hours24;
      let period = 'AM';
      
      if (hours24 >= 12) {
        period = 'PM';
        if (hours24 > 12) {
          hours12 = hours24 - 12;
        }
      }
      if (hours24 === 0) {
        hours12 = 12;
      }
      
      return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    },
    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.closeDropdown();
      }
    }
  },
  mounted() {
    this.parseTime(this.modelValue);
    this.displayValue = this.formatDisplayTime(
      parseInt(this.modelValue.split(':')[0], 10),
      parseInt(this.modelValue.split(':')[1], 10)
    );
    
    // 点击外部关闭下拉框
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // 移除事件监听器
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script> 