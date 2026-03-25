<template><canvas ref="canvas" class="particle-canvas"></canvas></template><script setup lang="ts">import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animationId: number | null = null;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const initCanvas = () => {
  if (!canvas.value) return;
  
  ctx = canvas.value.getContext('2d');
  if (!ctx) return;
  
  resizeCanvas();
  initParticles();
  animate();
  
  window.addEventListener('resize', resizeCanvas);
};

const resizeCanvas = () => {
  if (!canvas.value) return;
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
};

const initParticles = () => {
  particles = [];
  const particleCount = Math.floor(window.innerWidth * window.innerHeight / 15000);
  
  for (let i = 0; i< particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1
    });
  }
};

const animate = () => {
  if (!ctx || !canvas.value) return;
  
  const currentCanvas = canvas.value;
  const currentCtx = ctx;
  
  currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
  
  particles.forEach((particle, i) =>{
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    if (particle.x< 0 || particle.x >currentCanvas.width) {
      particle.vx *= -1;
    }
    if (particle.y< 0 || particle.y >currentCanvas.height) {
      particle.vy *= -1;
    }
    
    currentCtx.fillStyle = '#6b7280';
    currentCtx.beginPath();
    currentCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    currentCtx.fill();
    
    particles.slice(i + 1).forEach(otherParticle =>{
      const dx = particle.x - otherParticle.x;
      const dy = particle.y - otherParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance< 150) {
        currentCtx.beginPath();
        currentCtx.strokeStyle = `rgba(107, 114, 128, ${0.4 * (1 - distance / 150)})`;
        currentCtx.lineWidth = 1;
        currentCtx.moveTo(particle.x, particle.y);
        currentCtx.lineTo(otherParticle.x, otherParticle.y);
        currentCtx.stroke();
      }
    });
  });
  
  animationId = requestAnimationFrame(animate);
};

onMounted(() =>{
  initCanvas();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', resizeCanvas);
});</script><style scoped>.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}</style>