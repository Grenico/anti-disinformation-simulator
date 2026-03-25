<template><div class="title-page" :class="{ 'fade-in': isVisible }"><h1 class="game-title">驭星计划</h1><p class="subtitle">内容审核模拟器</p><div class="title-buttons"><button class="tech-button" @click="startGame" @mouseenter="handleButtonHover">开始游戏</button><button class="tech-button" @click="showLoadProgress" @mouseenter="handleButtonHover">读取进度</button></div><div class="version-info">版本：v1.0.0</div><div class="disclaimer">本作品纯属虚构。与一切真实人物、事件、团体、组织均无关联</div><!-- 读取进度弹窗 --><div class="modal-overlay" :class="{ 'show': showLoadModal }" @click="closeLoadModal"><div class="modal-content" :class="{ 'closing': isClosing }" @click.stop><div class="close-button" @click.stop="closeLoadModal">×</div><h2>读取进度</h2><div class="saves-list" v-if="saves.length >0"><div class="save-item" v-for="save in saves" :key="save.slot" @click="loadSave(save.slot)" @mouseenter="handleButtonHover"><div class="save-info"><div class="save-day">第 {{ save.currentDay }} 天<span class="auto-save-label" v-if="save.slot === 1">自动存档</span><span class="custom-save-label" v-else>自定义存档</span></div><div class="save-time">{{ formatTime(save.timestamp) }}</div></div><div class="save-score">存款：{{ save.totalSalary }}</div></div></div><div class="no-saves" v-else>没有找到存档</div></div></div></div></template><script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();
const showLoadModal = ref(false);
const saves = ref<any[]>([]);
const isVisible = ref(false);

// 音效管理 - 预加载音效以减少延迟
const sounds = {
  hover: new Audio('/assets/audio/sound-effects/title-page/title-btn-hover.mp3'),
  decide: new Audio('/assets/audio/sound-effects/title-page/decide.mp3'),
  close: new Audio('/assets/audio/sound-effects/title-page/loadwin-close.mp3')
};

// 背景音乐
const backgroundMusic = new Audio('/assets/audio/background/Megalopolis(title).mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// 设置音量
Object.values(sounds).forEach(audio => {
  audio.volume = 0.5;
});

// 预加载音效
const preloadSounds = () => {
  Object.values(sounds).forEach(audio => {
    audio.load();
  });
};

// 播放音效
const playSound = (type: keyof typeof sounds) => {
  const audio = sounds[type];
  // 重置播放位置并播放
  audio.currentTime = 0;
  audio.play().catch(e => console.log('音效播放失败:', e));
};

const startGame = async () => {
  playSound('decide');
  window.dispatchEvent(new CustomEvent('game-start'));
  await gameStore.startNewGame();
};

const showLoadProgress = () => {
  playSound('decide');
  // 限制最多显示5个存档
  saves.value = gameStore.getSaves().slice(0, 5);
  showLoadModal.value = true;
};

const isClosing = ref(false);

const closeLoadModal = () => {
  playSound('close');
  isClosing.value = true;
  
  // 等待动画结束后关闭弹窗
  setTimeout(() => {
    showLoadModal.value = false;
    isClosing.value = false;
  }, 300);
};

const loadSave = async (slot: number) => {
  playSound('decide');
  window.dispatchEvent(new CustomEvent('game-start'));
  await gameStore.loadSave(slot);
};

const handleButtonHover = () => {
  playSound('hover');
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 组件挂载时触发渐显效果和预加载音效
onMounted(() => {
  // 预加载音效
  preloadSounds();
  
  // 组件挂载后直接播放背景音乐
  backgroundMusic.load();
  backgroundMusic.play().catch(e => console.log('背景音乐播放失败:', e));
  
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});

// 组件卸载时停止背景音乐
onUnmounted(() => {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
});</script><style scoped>.title-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  position: relative;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.title-page.fade-in {
  opacity: 1;
}

.game-title {
  font-size: 56px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.subtitle {
  font-size: 20px;
  color: #94a3b8;
  margin-bottom: 80px;
  text-shadow: 0 0 10px rgba(148, 163, 184, 0.3);
}

.title-buttons {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.version-info {
  position: absolute;
  bottom: 60px;
  font-size: 14px;
  color: #64748b;
  text-shadow: 0 0 5px rgba(100, 116, 139, 0.3);
}

.disclaimer {
  position: absolute;
  bottom: 30px;
  font-size: 12px;
  color: #94a3b8;
  text-shadow: 0 0 5px rgba(148, 163, 184, 0.2);
  text-align: center;
  max-width: 500px;
}

.title-page .tech-button {
  border-radius: 0;
  color: #f0f0f0;
  border: 1px solid rgba(26, 143, 189, 0.46);
}

/* 读取进度弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(24, 24, 24, 0.73);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-overlay.show {
  display: flex;
}

.modal-content {
  background: #4e91b12b;
  backdrop-filter: blur(3px);
  border-radius: 0;
  padding: 24px;
  width: 400px;
  max-width: 90%;
  position: relative;
  box-shadow: 0 0 50px rgba(122, 138, 144, 0.4);
  overflow: hidden;
  max-height: 570px;
  transition: max-height 0.3s ease, padding 0.3s ease, opacity 0.3s ease;
}

.modal-content.closing {
  max-height: 0;
  padding: 0 24px;
  opacity: 0;
}

.modal-content::before,
.modal-content::after {
  display: none;
}

.modal-content h2 {
  color: #e2e8f0;
  margin-bottom: 24px;
  text-align: center;
}

.close-button {
  position: absolute;
  top: 7px;
  right: 5px;
  background: rgba(255, 255, 255, 0);
  border: none;
  font-size: 24px;
  color: #5cb8d6d4;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  color: #0aaade;
  background: none;
  border-color: transparent;
  box-shadow: none;
  transform: none;
}

.saves-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(26, 143, 189, 0.3);
  border-radius: 0;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.save-item:hover {
  background: rgba(10, 170, 222, 0.1);
  border-color: #0aaade;
}

.save-info {
  flex: 1;
}

.save-day {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.auto-save-label {
  font-size: 12px;
  font-weight: 400;
  color: #0aaade;
  background: rgba(10, 170, 222, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(10, 170, 222, 0.3);
  margin-left: 38px;
}

.custom-save-label {
  font-size: 12px;
  font-weight: 400;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  margin-left: 38px;
}

.save-time {
  font-size: 12px;
  color: #94a3b8;
}

.save-score {
  font-size: 14px;
  font-weight: 500;
  color: #0aaade;
}

.no-saves {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .game-title {
    font-size: 40px;
  }
  
  .title-buttons {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .tech-button {
    width: 240px;
  }
  
  .modal-content {
    width: 90%;
    padding: 20px;
  }
}</style>