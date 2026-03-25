<template><div class="producer-page" :class="{ 'fade-out': isFadingOut }"><div class="producer-text" :class="{ 'show': showText, 'fade-out': fadeOutText }">Grenico x <span class="trae-text">TRAE</span></div></div></template><script setup lang="ts">import { ref, onMounted } from 'vue';

const showText = ref(false);
const fadeOutText = ref(false);
const isFadingOut = ref(false);

onMounted(() => {
  // 显示制作人文字
  setTimeout(() => {
    showText.value = true;
    
    // 延迟后渐隐文字
      setTimeout(() => {
        fadeOutText.value = true;
        
        // 等待文字淡出完成后再让页面淡出，并立即触发事件
        setTimeout(() => {
          isFadingOut.value = true;
          window.dispatchEvent(new CustomEvent('producer-completed'));
        }, 800); // 等待文字淡出动画完成（800ms）
      }, 2000);
  }, 500);
});</script><style scoped>.producer-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #000000;
  opacity: 1;
  transition: opacity 0.8s ease;
}

.producer-page.fade-out {
  opacity: 0;
}

.producer-text {
  font-size: 48px;
  font-weight:bold;
  font-family:Arial, Helvetica, sans-serif;
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.producer-text.show {
  opacity: 1;
}

.producer-text.fade-out {
  opacity: 0;
  transition: opacity 0.8s ease;
}

.trae-text {
  color: #32f08c;
}</style>