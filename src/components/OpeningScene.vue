<template><div class="opening-scene" :class="{ 'fade-out': isFadingOut, 'loading': isLoading }" @click="handleClick"><div class="loading-screen" v-if="isLoading"><div class="loading-spinner"></div><div class="loading-text">加载中...</div></div><div class="opening-content" v-if="!isLoading"><div class="opening-text">{{ displayedText }}<span class="cursor" :class="{ 'blink': isWaitingForClick }"></span></div></div><div class="click-hint" v-if="!isLoading && isWaitingForClick">点击 / 按Enter继续</div></div></template><script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue';

const displayedText = ref('');
const isWaitingForClick = ref(false);
const isFadingOut = ref(false);
const isProcessing = ref(false);
const isLoading = ref(true);
// 标记开场动画是否已经完成，防止重复触发
let openingCompleted = false;

// 音效管理 - 预加载音效以减少延迟
const sounds = {
  skip: new Audio('/assets/audio/sound-effects/opening-scene/skip.mp3'),
  typing: new Audio('/assets/audio/sound-effects/opening-scene/typing.mp3')
};

// 背景音乐
const backgroundMusic = new Audio('/assets/audio/background/Automata(opening).mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

// 设置音量
Object.values(sounds).forEach(audio => {
  audio.volume = 0.3;
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
  audio.currentTime = 0;
  audio.play().catch(e => console.log('音效播放失败:', e));
};

// 打字音效实例
let typingAudio: HTMLAudioElement | null = sounds.typing;



// 开场文本
const openingText = `2064年，人类迈入"星河纪元"。量子计算、人工智能、脑机接口、可控核聚变等技术全面成熟，全球信息流动速度达到前所未有的高度。咚达、辉光联邦、樱都国、北陆联邦等主要力量在科技与经济上竞合交织，一个高度互联又充满争议的"后真相时代"悄然到来。

但这一切似乎都与你无关，你只是"星网"信息安全局的见习审核员。时间差不多了，该上班了。`;

// 第一段结束的位置
const firstParagraphEnd = openingText.indexOf('\n\n');
const secondParagraphEnd = openingText.length;

let typeIndex = 0;
let typingInterval: number;

const startTyping = () => {
  displayedText.value = '';
  typeIndex = 0;
  isWaitingForClick.value = false;
  
  // 播放打字音效
  typingAudio.currentTime = 0;
  typingAudio.play().catch(e => console.log('打字音效播放失败:', e));
  
  const typeNextChar = () => {
    if (typeIndex < openingText.length) {
      displayedText.value += openingText.charAt(typeIndex);
      typeIndex++;
      
      // 第一段结束时等待点击
      if (typeIndex === firstParagraphEnd) {
        clearTimeout(typingInterval);
        isWaitingForClick.value = true;
        stopTypingSound();
      } 
      // 第二段结束时等待点击
      else if (typeIndex === secondParagraphEnd) {
        clearTimeout(typingInterval);
        isWaitingForClick.value = true;
        stopTypingSound();
      } else {
        typingInterval = window.setTimeout(typeNextChar, 80);
      }
    }
  };
  
  typeNextChar();
};

const continueTyping = () => {
  isWaitingForClick.value = false;
  
  // 添加换行符
  displayedText.value += '\n\n';
  
  // 重新播放打字音效
  if (typingAudio) {
    typingAudio.currentTime = 0;
    typingAudio.play().catch(e => console.log('打字音效播放失败:', e));
  }
  
  const typeNextChar = () => {
    if (typeIndex < openingText.length) {
      // 跳过换行符
      if (openingText.charAt(typeIndex) === '\n') {
        typeIndex++;
        typeNextChar();
        return;
      }
      
      displayedText.value += openingText.charAt(typeIndex);
      typeIndex++;
      
      // 第二段结束时等待点击
      if (typeIndex === secondParagraphEnd) {
        clearTimeout(typingInterval);
        isWaitingForClick.value = true;
        stopTypingSound();
      } else {
        typingInterval = window.setTimeout(typeNextChar, 80);
      }
    }
  };
  
  typeNextChar();
};

const stopTypingSound = () => {
  if (typingAudio) {
    typingAudio.pause();
    typingAudio.currentTime = 0;
  }
};

const handleContinue = () => {
  // 防止重复执行
  if (isProcessing.value || isFadingOut.value || openingCompleted) {
    return;
  }
  
  isProcessing.value = true;
  
  if (isWaitingForClick.value) {
    if (typeIndex === firstParagraphEnd) {
      // 第一段结束后继续打字
      continueTyping();
    } else if (typeIndex === secondParagraphEnd) {
      // 第二段结束后渐隐进入游戏
      isFadingOut.value = true;
      // 立即标记为已完成，防止重复触发
      openingCompleted = true;
      // 立即移除所有事件监听器，防止后续点击触发
      window.removeEventListener('keydown', handleKeyDown);
      
      // 停止背景音乐
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      
      // 等待渐隐动画完成后再触发事件（2秒）
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('opening-completed'));
      }, 2000);
    }
  } else {
    // 在打字过程中，直接显示当前段落的所有文本
    clearTimeout(typingInterval);
    stopTypingSound();
    
    if (typeIndex < firstParagraphEnd) {
      // 显示第一段剩余文本
      displayedText.value = openingText.substring(0, firstParagraphEnd);
      typeIndex = firstParagraphEnd;
      isWaitingForClick.value = true;
    } else if (typeIndex < secondParagraphEnd) {
      // 显示第二段剩余文本
      displayedText.value = openingText;
      typeIndex = secondParagraphEnd;
      isWaitingForClick.value = true;
    }
  }
  
  // 重置处理状态
  setTimeout(() => {
    isProcessing.value = false;
  }, 100);
};

const handleClick = () => {
  // 防止重复执行
  if (isProcessing.value || isFadingOut.value || openingCompleted) {
    return;
  }
  handleContinue();
};

// 监听键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 防止重复执行
  if (isProcessing.value || isFadingOut.value || openingCompleted) {
    return;
  }
  if (event.key === 'Enter') {
    playSound('skip');
    handleContinue();
  }
};



// 预加载背景图片
const preloadBackgroundImage = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/assets/images/opening-background.jpg';
    img.onload = () => {
      console.log('背景图片加载完成');
      resolve(true);
    };
    img.onerror = () => {
      console.error('背景图片加载失败');
      resolve(false);
    };
  });
};

onMounted(async () => {
  // 预加载音效
  preloadSounds();
  
  // 预加载背景图片
  await preloadBackgroundImage();
  
  // 图片加载完成后才开始
  isLoading.value = false;
  
  // 播放背景音乐
  backgroundMusic.load();
  backgroundMusic.play().catch(e => console.log('背景音乐播放失败:', e));
  
  startTyping();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  clearTimeout(typingInterval);
  stopTypingSound();
  
  // 停止背景音乐
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
});</script><style scoped>.opening-scene {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  padding: 80px;
  text-align: left;
  background-image: url('/assets/images/opening-background.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  transition: opacity 2s ease;
}

.opening-scene.loading {
  opacity: 0;
  pointer-events: none;
}

.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 255, 255, 0.3);
  border-top: 4px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.opening-scene::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1;
}

.opening-content {
  max-width: 800px;
  position: relative;
  z-index: 2;
}

.opening-text {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  line-height: 1.8;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4);
  white-space: pre-wrap;
  position: relative;
}

.cursor {
  display: inline-block;
  width: 3px;
  height: 28px;
  background-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  vertical-align: text-bottom;
  margin-left: 2px;
}

.cursor.blink {
  animation: blink 1s infinite;
}

.click-hint {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  margin-top: 40px;
  position: relative;
  z-index: 2;
  animation: pulse 2s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.fade-out {
  opacity: 0;
}

@media (max-width: 768px) {
  .opening-scene {
    padding: 40px 20px;
  }
  
  .opening-text {
    font-size: 16px;
    line-height: 1.6;
  }
  
  .click-hint {
    font-size: 12px;
  }
}</style>