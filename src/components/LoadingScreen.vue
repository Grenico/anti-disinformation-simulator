<template><div class="loading-screen"><div class="loading-content"><h2 class="loading-title">内容审核模拟器</h2><div class="loading-bar-container"><div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div></div><p class="loading-text">正在加载游戏资源...</p></div></div></template><script setup lang="ts">import { ref, onMounted } from 'vue';

const loadingProgress = ref(0);

// 模拟加载过程
onMounted(() => {
const loadingInterval = setInterval(() => {
loadingProgress.value += 1;
if (loadingProgress.value >= 100) {
clearInterval(loadingInterval);
// 进度条达到100%时才触发加载完成事件
window.dispatchEvent(new CustomEvent('game-loaded'));
}
}, 60); // 每60ms增加1%，大约6秒完成加载，与实际加载时间更匹配
});</script><style scoped>.loading-screen {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: #242424;
display: flex;
align-items: center;
justify-content: center;
z-index: 9999;
}

.loading-content {
text-align: center;
padding: 40px;
}

.loading-title {
font-size: 32px;
font-weight: bold;
color: #ffffff;
margin-bottom: 40px;
text-transform: uppercase;
letter-spacing: 2px;
}

.loading-bar-container {
width: 300px;
height: 4px;
background: rgba(255, 255, 255, 0.2);
margin: 0 auto 20px;
position: relative;
overflow: hidden;
}

.loading-bar {
height: 100%;
background: #0aaade;
transition: width 0.3s ease;
}</style>