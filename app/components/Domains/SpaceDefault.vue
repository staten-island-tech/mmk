<template>
  <div class="starfield-fullscreen">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let animationFrame: number | null = null
let startTime = 0

let timeLocation: WebGLUniformLocation | null = null
let resolutionLocation: WebGLUniformLocation | null = null

// -------------------------
// Vertex Shader
// -------------------------
const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// -------------------------
// Fragment Shader
// -------------------------
const fsSource = `
  precision mediump float;

  uniform float t;
  uniform vec2 r;

  // ---- hash / noise helpers ----
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Smooth star shape: returns brightness 0..1 for a point at uv
  float star(vec2 uv, float size, float sharpness) {
    float d = length(uv);
    // Core bright disc
    float core = smoothstep(size, size * 0.1, d);
    // Cross diffraction spikes
    float spike1 = exp(-abs(uv.x) * sharpness) * exp(-abs(uv.y) * sharpness * 6.0);
    float spike2 = exp(-abs(uv.y) * sharpness) * exp(-abs(uv.x) * sharpness * 6.0);
    float spikes = max(spike1, spike2) * smoothstep(size * 4.0, 0.0, d);
    // Soft halo
    float halo = exp(-d * sharpness * 0.4) * 0.25;
    return clamp(core + spikes * 0.6 + halo, 0.0, 1.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / r;           // 0..1
    vec2 aspect = vec2(r.x / r.y, 1.0);

    float time = t;

    vec3 color = vec3(0.0);

    // ---- Layer parameters ----
    // Each layer: different count, speed, depth/size scale, hue tint
    // We render N_LAYERS separate "sheets" of stars

    // Layer 1 — very fast, tiny, white-blue (closest)
    {
      float speed   = 0.55;
      float count   = 180.0;
      float sizeBase = 0.003;
      vec3  tint    = vec3(0.75, 0.88, 1.0);

      for (float i = 0.0; i < 180.0; i++) {
        float seed  = i * 1.7324;
        float xSeed = hash(seed);
        float ySeed = hash(seed + 0.5);
        float vx    = (hash(seed + 1.1) - 0.3) * speed;   // mostly rightward
        float vy    = (hash(seed + 2.2) - 0.5) * speed * 0.25;
        float phase = hash(seed + 3.3);                    // starting phase

        vec2 pos;
        pos.x = fract(xSeed + vx * time + phase);
        pos.y = fract(ySeed + vy * time);

        float sz    = sizeBase * (0.4 + hash(seed + 4.4) * 0.9);
        float sharp = 180.0 / sz;

        vec2 delta  = (uv - pos) * aspect;
        float b     = star(delta, sz, sharp);

        // Twinkle
        float twinkle = 0.7 + 0.3 * sin(time * (3.0 + hash(seed + 5.5) * 6.0) + phase * 6.28);
        color += tint * b * twinkle;
      }
    }

    // Layer 2 — medium speed, medium size, warm white
    {
      float speed   = 0.28;
      float sizeBase = 0.0055;
      vec3  tint    = vec3(1.0, 0.96, 0.88);

      for (float i = 0.0; i < 90.0; i++) {
        float seed  = i * 3.1592 + 1000.0;
        float xSeed = hash(seed);
        float ySeed = hash(seed + 0.5);
        float vx    = (hash(seed + 1.1) - 0.25) * speed;
        float vy    = (hash(seed + 2.2) - 0.5)  * speed * 0.2;
        float phase = hash(seed + 3.3);

        vec2 pos;
        pos.x = fract(xSeed + vx * time + phase);
        pos.y = fract(ySeed + vy * time);

        float sz    = sizeBase * (0.5 + hash(seed + 4.4) * 0.8);
        float sharp = 160.0 / sz;

        vec2 delta  = (uv - pos) * aspect;
        float b     = star(delta, sz, sharp);

        float twinkle = 0.65 + 0.35 * sin(time * (2.0 + hash(seed + 5.5) * 4.0) + phase * 6.28);
        color += tint * b * twinkle;
      }
    }

    // Layer 3 — slow, large, bright — background giants
    {
      float speed   = 0.10;
      float sizeBase = 0.010;
      vec3  tint    = vec3(0.9, 0.95, 1.0);

      for (float i = 0.0; i < 40.0; i++) {
        float seed  = i * 5.7721 + 2000.0;
        float xSeed = hash(seed);
        float ySeed = hash(seed + 0.5);
        float vx    = (hash(seed + 1.1) - 0.2) * speed;
        float vy    = (hash(seed + 2.2) - 0.5) * speed * 0.15;
        float phase = hash(seed + 3.3);

        vec2 pos;
        pos.x = fract(xSeed + vx * time + phase);
        pos.y = fract(ySeed + vy * time);

        float sz    = sizeBase * (0.6 + hash(seed + 4.4) * 0.7);
        float sharp = 120.0 / sz;

        vec2 delta  = (uv - pos) * aspect;
        float b     = star(delta, sz, sharp);

        float twinkle = 0.55 + 0.45 * sin(time * (1.0 + hash(seed + 5.5) * 2.5) + phase * 6.28);
        color += tint * b * twinkle * 1.3;
      }
    }

    // Layer 4 — ultra-fast streak layer (motion blur look)
    {
      float speed   = 1.4;
      float sizeBase = 0.0018;
      vec3  tint    = vec3(0.6, 0.75, 1.0);

      for (float i = 0.0; i < 60.0; i++) {
        float seed  = i * 2.3456 + 3000.0;
        float xSeed = hash(seed);
        float ySeed = hash(seed + 0.5);
        float vx    = (hash(seed + 1.1) * 0.7 + 0.3) * speed; // all moving right fast
        float vy    = (hash(seed + 2.2) - 0.5) * speed * 0.08;
        float phase = hash(seed + 3.3);

        vec2 pos;
        pos.x = fract(xSeed + vx * time + phase);
        pos.y = fract(ySeed + vy * time);

        // Streaked shape: elongate horizontally
        vec2 delta = (uv - pos) * aspect;
        delta.x *= 0.15; // squish x → horizontal streak

        float sz    = sizeBase * (0.5 + hash(seed + 4.4));
        float sharp = 200.0 / sz;
        float b     = star(delta, sz, sharp) * 0.7;

        color += tint * b;
      }
    }

    // Subtle deep-space gradient backdrop (very faint, not black)
    vec2 centered = uv - 0.5;
    float vignette = 1.0 - dot(centered, centered) * 1.2;
    vec3 bg = vec3(0.01, 0.01, 0.025) * vignette;

    gl_FragColor = vec4(bg + color, 1.0);
  }
`

// -------------------------
// Shader utils
// -------------------------
function createShader(
  ctx: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = ctx.createShader(type)
  if (!shader) return null
  ctx.shaderSource(shader, source)
  ctx.compileShader(shader)
  if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    console.error('[StarField] shader error:', ctx.getShaderInfoLog(shader))
    ctx.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(ctx: WebGLRenderingContext): WebGLProgram | null {
  const vs = createShader(ctx, ctx.VERTEX_SHADER, vsSource)
  const fs = createShader(ctx, ctx.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return null

  const prog = ctx.createProgram()
  if (!prog) return null

  ctx.attachShader(prog, vs)
  ctx.attachShader(prog, fs)
  ctx.linkProgram(prog)

  if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
    console.error('[StarField] program link error:', ctx.getProgramInfoLog(prog))
    return null
  }
  return prog
}

// -------------------------
// Resize
// -------------------------
function resize(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  if (gl) gl.viewport(0, 0, canvas.width, canvas.height)
}

// -------------------------
// Render loop
// -------------------------
function startRenderLoop(canvas: HTMLCanvasElement) {
  function render() {
    if (!gl || !program || !timeLocation || !resolutionLocation) return

    const time = (performance.now() - startTime) / 1000

    gl.uniform1f(timeLocation, time)
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animationFrame = requestAnimationFrame(render)
  }
  render()
}

// -------------------------
// Lifecycle
// -------------------------
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas || import.meta.server) return

  gl = canvas.getContext('webgl')
  if (!gl) {
    console.error('[StarField] WebGL not supported')
    return
  }

  program = createProgram(gl)
  if (!program) return

  gl.useProgram(program)

  const posLoc = gl.getAttribLocation(program, 'a_position')
  timeLocation = gl.getUniformLocation(program, 't')
  resolutionLocation = gl.getUniformLocation(program, 'r')

  const vertices = new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1,
  ])

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  resize(canvas)
  window.addEventListener('resize', () => resize(canvas))

  startTime = performance.now()
  startRenderLoop(canvas)
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.starfield-fullscreen {
  position: fixed;
  inset: 0;
  background: #000;
  pointer-events: none;
  z-index: 0;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>