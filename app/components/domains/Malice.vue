<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none z-30 fixed top-0 left-0 w-full h-full"
  ></canvas>
</template>

<script lang="ts" setup>
defineExpose({
  THEME_BACKGROUND: "#1a0000",
  THEME_BACKGROUND_GRID: "#3d0a0a",
  THEME_GROUND: "#2a0505",
  THEME_GROUND_GRID: "#4a1010",
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let offscreen: HTMLCanvasElement | null = null;
let offCtx: CanvasRenderingContext2D | null = null;
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
    this.message = Math.random() < 0.1 ? "HOS" : null;
    this.angle = Math.random() * Math.PI * 2;

    this.length = intense ? Math.random() * 300 + 70 : Math.random() * 500 + 30;
    this.life = intense ? Math.random() * 20 + 15 : Math.random() * 20 + 10;
    this.thickness = intense ? Math.random() * 5 + 4 : Math.random() * 2 + 1;
    this.speed = intense ? Math.random() * 2 + 4 : Math.random() * 8 + 2.5;
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

    // Slash
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
  if (!canvasRef.value || !offscreen) return;
  canvasRef.value.width = canvasRef.value.clientWidth;
  canvasRef.value.height = canvasRef.value.clientHeight;
  offscreen.width = canvasRef.value.width;
  offscreen.height = canvasRef.value.height;
}

function spawnSlashes(count: number, intense = false) {
  if (!canvasRef.value) return;
  for (let i = 0; i < count; i++) {
    slashes.push(
      new Slash(canvasRef.value.width, canvasRef.value.height, intense),
    );
  }
}

function spawnSplatter(count: number) {
  if (!canvasRef.value) return;
  for (let i = 0; i < count; i++) {
    splatters.push(new Splatter(canvasRef.value.width, canvasRef.value.height));
  }
}

function animate() {
  if (!ctx || !offCtx || !canvasRef.value || !offscreen) return;

  const { width, height } = canvasRef.value;

  offCtx.globalCompositeOperation = "destination-out";
  offCtx.fillStyle = "rgba(0, 0, 0, 0.09)";
  offCtx.fillRect(0, 0, width, height);
  offCtx.globalCompositeOperation = "source-over";

  const shakeX = (Math.random() - 0.5) * 3.5;
  const shakeY = (Math.random() - 0.5) * 3.5;

  offCtx.save();
  offCtx.translate(shakeX, shakeY);
  offCtx.globalCompositeOperation = "lighter";

  for (let i = slashes.length - 1; i >= 0; i--) {
    const s = slashes[i];
    if (!s) continue;
    s.update();
    s.draw(offCtx);
    if (s.life <= 0) slashes.splice(i, 1);
  }

  for (let i = splatters.length - 1; i >= 0; i--) {
    const sp = splatters[i];
    if (!sp) continue;
    sp.update();
    sp.draw(offCtx);
    if (sp.life <= 0) splatters.splice(i, 1);
  }

  offCtx.restore();

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreen, 0, 0);

  if (Math.random() < 0.5) spawnSlashes(2);
  if (Math.random() < 0.085) {
    spawnSlashes(1, true);
    spawnSplatter(1);
  }

  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  if (!canvasRef.value) return;

  ctx = canvasRef.value.getContext("2d", { alpha: true });
  if (!ctx) return;

  offscreen = document.createElement("canvas");
  offCtx = offscreen.getContext("2d", { alpha: true });
  if (!offCtx) return;

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  spawnSlashes(1);
  spawnSplatter(1);

  animate();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style scoped></style>
