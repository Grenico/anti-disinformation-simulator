<template><div class="app"><ParticleBackground /><ProducerPage v-if="isProducer" /><TitlePage v-if="!isGameStarted && !isLoading && !isOpening && !isProducer" /><OpeningScene v-if="isOpening" /><LoadingScreen v-if="isLoading && !isLoadingComplete" /><GamePage v-if="isGameStarted && !isLoading" /></div></template><script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue';
import TitlePage from './components/TitlePage.vue';
import GamePage from './components/GamePage.vue';
import ParticleBackground from './components/ParticleBackground.vue';
import LoadingScreen from './components/LoadingScreen.vue';
import OpeningScene from './components/OpeningScene.vue';
import ProducerPage from './components/ProducerPage.vue';
import { useGameStore } from './stores/gameStore';

const isGameStarted = ref(false);
const isLoading = ref(false);
const isOpening = ref(false);
const isLoadingComplete = ref(false);
const isProducer = ref(true);
const gameStore = useGameStore();
// 防止开场动画重复触发
let openingAnimationTriggered = false;

const handleBeforeUnload = () => {
// 页面关闭或刷新时自动存档
if (isGameStarted.value) {
gameStore.saveProgress();
}
};

onMounted(() => {
// 监听游戏开始事件
window.addEventListener('game-start', () => {
isLoading.value = true;
isLoadingComplete.value = false;
});

// 监听游戏加载完成事件
window.addEventListener('game-loaded', () => {
  isLoadingComplete.value = true;
  isLoading.value = false;
  
  // 只有在第一天的开头才显示开场动画，并且只显示一次
  if (gameStore.currentDay === 1 && gameStore.currentIndex === 0 && !openingAnimationTriggered) {
    openingAnimationTriggered = true;
    isOpening.value = true;
  } else {
    isGameStarted.value = true;
  }
});

// 监听开场介绍完成事件
window.addEventListener('opening-completed', () => {
isOpening.value = false;
isGameStarted.value = true;
});

// 监听游戏退出事件
window.addEventListener('game-quit', () => {
  isGameStarted.value = false;
});

// 监听制作人页面完成事件
window.addEventListener('producer-completed', () => {
  isProducer.value = false;
});

// 添加页面关闭时的自动存档
window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
// 移除事件监听
window.removeEventListener('beforeunload', handleBeforeUnload);
});</script><style>@import './assets/styles/globals.css';

.app {
min-height: 100vh;
}</style>