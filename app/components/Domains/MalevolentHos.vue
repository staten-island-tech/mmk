<template>
  <canvas ref="canvas" class="bg-canvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number | null = null;

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

    this.length = intense ? Math.random() * 300 + 70 : Math.random() * 125 + 30;
    this.life = intense ? Math.random() * 20 + 15 : Math.random() * 40 + 30;
    this.thickness = intense ? Math.random() * 5 + 4 : Math.random() * 2 + 1;
    this.speed = intense ? Math.random() * 12 + 4 : Math.random() * 8 + 2.5;
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
    const alpha = Math.max(this.life / 40, 0);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Outer glow
    ctx.strokeStyle = `rgba(255, 40, 40, ${alpha * 0.35})`;
    ctx.lineWidth = this.thickness * 2.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.length, 0);
    ctx.stroke();

    // Main slash
    ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
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
    ctx.stroke();

    // Message
    if (this.message && alpha > 0.25) {
      ctx.font = `bold ${13 + this.thickness}px monospace`;
      ctx.fillStyle = `rgba(255, 70, 70, ${alpha})`;
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 15;
      ctx.fillText(this.message, 8, 24);
      ctx.shadowBlur = 0;
    }

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
    this.radius = Math.random() * 24 + 8;
    this.life = Math.random() * 14 + 24;
  }

  update() {
    this.life--;
    this.radius *= 0.975;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / 75;
    ctx.fillStyle = `rgba(160, 0, 0, ${alpha})`;

    ctx.beginPath();
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const r = this.radius + (Math.random() - 0.5) * 6;
      const px = this.x + Math.cos(a) * r;
      const py = this.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
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

function animate() {
  if (!ctx || !canvas.value) return;

  const { width, height } = canvas.value;

  // Light fade - allows background to show through
  ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
  ctx.fillRect(0, 0, width, height);

  const shakeX = (Math.random() - 0.5) * 3.5;
  const shakeY = (Math.random() - 0.5) * 3.5;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.globalCompositeOperation = "lighter";

  // Draw slashes
  for (let i = slashes.length - 1; i >= 0; i--) {
    slashes[i].update();
    slashes[i].draw(ctx);
    if (slashes[i].life <= 0) slashes.splice(i, 1);
  }

  // Draw splatters
  for (let i = splatters.length - 1; i >= 0; i--) {
    splatters[i].update();
    splatters[i].draw(ctx);
    if (splatters[i].life <= 0) splatters.splice(i, 1);
  }

  ctx.restore();

  // Spawn logic
  if (Math.random() < 0.32) spawnSlashes(7);
  if (Math.random() < 0.085) {
    spawnSlashes(38, true);
    spawnSplatter(4);
  }

  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  if (!canvas.value) return;

  ctx = canvas.value.getContext("2d", { alpha: true });
  if (!ctx) return;

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  spawnSlashes(45);
  spawnSplatter(6);

  animate();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
  pointer-events: none;
  background: transparent;
}
</style>