<template><div class="special-event" :class="{ 'show': isVisible }" @click="handleContinue"><div class="event-window" :class="{ 'expand': isExpanded }"><div class="event-content" :class="{ 'show': showContent }"><h3>{{ eventTitle }}</h3><p v-html="eventContent"></p><div class="continue-hint" v-if="showContent">点击 / 按Enter继续</div></div></div></div></template><script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  eventTitle: string;
  eventContent: string;
}>();

const isVisible = ref(false);
const isExpanded = ref(false);
const showContent = ref(false);

const endEvent = () => {
  // 发送事件通知播放窗口关闭音效
  window.dispatchEvent(new CustomEvent('special-event-closed'));
  isVisible.value = false;
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('special-event-completed'));
  }, 800);
};

const handleContinue = () => {
  if (isExpanded.value && showContent.value) {
    endEvent();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && isExpanded.value && showContent.value) {
    endEvent();
  }
};

onMounted(() => {
  // 先显示容器
  setTimeout(() => {
    isVisible.value = true;
    
    // 发送事件通知播放窗口出现音效
    window.dispatchEvent(new CustomEvent('special-event-opened'));
    
    // 延迟后展开窗口
    setTimeout(() => {
      isExpanded.value = true;
      
      // 窗口展开完成后显示内容
      setTimeout(() => {
        showContent.value = true;
      }, 800);
    }, 300);
  }, 100);
  
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});</script><style scoped>.special-event {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 99999;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.special-event.show {
  opacity: 1;
  backdrop-filter: blur(8px);
}

.event-window {
  background: rgba(46, 145, 177, 0.27);
  border: 2px solid rgba(10, 170, 222, 0.6);
  border-radius: 0;
  padding: 0;
  width: 0;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.8s ease;
  position: relative;
  overflow: hidden;
}

.event-window.expand {
  width: 600px;
}

.event-content {
  padding: 40px;
  color: #ffffff;
  text-align: start;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.event-content.show {
  opacity: 1;
}

.event-content h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #0aaade;
  text-shadow: 0 0 20px rgba(10, 170, 222, 0.6);
}

.event-content p {
  font-size: 18px;
  line-height: 1.6;
  color: #ffffff;
}

.continue-hint {
  font-size: 14px;
  color: #0aaade;
  text-shadow: 0 0 10px rgba(10, 170, 222, 0.8);
  margin-top: 32px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}</style>