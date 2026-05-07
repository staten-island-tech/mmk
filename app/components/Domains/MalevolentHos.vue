<template>
  <canvas ref="canvas" class="bg-canvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number;

let slashes: Slash[] = [];
let splatters: Splatter[] = [];

class Slash {
  x: number;
  y: number;
  angle: number;
  length: number;
  life: number;
  thickness: number;
  speed: number;
  jitter: number;
  message: string | null;

  constructor(width: number, height: number, intense = false) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.message = Math.random() < 0.37 ? `HOS: ${Math.floor(Math.random() * 68)}` : null;
    this.angle = Math.random() * Math.PI * 2;

    this.length = intense
      ? Math.random() * 300 + 70
      : Math.random() * 125 + 30;

    this.life = intense
      ? Math.random() * 20 + 15
      : Math.random() * 40 + 30;

    this.thickness = intense
      ? Math.random() * 5 + 4
      : Math.random() * 2 + 1;

    this.speed = intense
      ? Math.random() * 12 + 4
      : Math.random() * 8 + 2.5;

    this.jitter = Math.random() * 30;
  }

  update() {
    this.life--;

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    this.x += (Math.random() - 0.5) * 2;
    this.y += (Math.random() - 0.5) * 2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / 40;

    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.strokeStyle = `rgba(255,0,0,${alpha * 0.3})`;
    ctx.lineWidth = this.thickness * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.length, 0);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,0,0,${alpha})`;
    ctx.lineWidth = this.thickness;

    ctx.beginPath();

    let x = 0;
    let y = 0;
    ctx.moveTo(x, y);

    for (let i = 0; i < 7; i++) {
      x += this.length / 7;
      y += (Math.random() - 0.5) * this.jitter;
      ctx.lineTo(x, y);
    }
    if (this.message) {
  const alpha = this.life / 40;
  ctx.font = `bold ${12 + this.thickness}px monospace`;
  ctx.fillStyle = `rgba(255, 40, 40, ${alpha})`;
  ctx.shadowColor = `rgba(255, 0, 0, ${alpha})`;
  ctx.shadowBlur = 8;
  ctx.fillText(this.message, 0, 18);
  ctx.shadowBlur = 0;
}

    ctx.stroke();

    ctx.restore();
  }
}

class Splatter {
  x: number;
  y: number;
  radius: number;
  life: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 20 + 5;
    this.life = Math.random() * 10 + 20;
  }

  update() {
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / 90;

    ctx.fillStyle = `rgba(120,0,0,${alpha})`;

    ctx.beginPath();

    const points = 7;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = this.radius + (Math.random() - 0.5) * 4;

      const x = this.x + Math.cos(angle) * r;
      const y = this.y + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.fill();
  }
}

function resizeCanvas() {
  if (!canvas.value) return;
  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;
}

function spawnSlashes(count: number, intense = false) {
  if (!canvas.value) return;

  for (let i = 0; i < count; i++) {
    slashes.push(new Slash(canvas.value.width, canvas.value.height, intense));
  }
}

function spawnSplatter(count: number) {
  if (!canvas.value) return;

  for (let i = 0; i < count; i++) {
    splatters.push(new Splatter(canvas.value.width, canvas.value.height));
  }
}

function drawBackground() {
  if (!ctx || !canvas.value) return;

  const { width, height } = canvas.value;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, width, height);

  if (Math.random() < 0.06) {
    ctx.fillStyle = "rgba(255,0,0,0.06)";
    ctx.fillRect(0, 0, width, height);
  }
}

function animate() {
  if (!ctx || !canvas.value) return;

  const shakeX = (Math.random() - 0.5) * 4;
  const shakeY = (Math.random() - 0.5) * 4;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawBackground();

  ctx.globalCompositeOperation = "lighter";

  slashes.forEach((s, i) => {
    s.update();
    s.draw(ctx!);
    if (s.life <= 0) slashes.splice(i, 1);
  });

  splatters.forEach((s, i) => {
    s.update();
    s.draw(ctx!);
    if (s.life <= 0) splatters.splice(i, 1);
  });

  ctx.globalCompositeOperation = "source-over";

  ctx.restore();

  if (Math.random() < 0.3) spawnSlashes(12);

  if (Math.random() < 0.08) {
    spawnSlashes(40, true);
    spawnSplatter(3);
  }

  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  if (!canvas.value) return;

  ctx = canvas.value.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  spawnSlashes(80);

  animate();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style scoped>
.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: black;
}
</style>