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

const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fsSource = `
  precision highp float;

  uniform float t;
  uniform vec2 r;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
    float time = t * 2.45;
    vec3 color = vec3(0.0);

    float vertDist = abs(uv.y);                    // distance from horizontal center

    // ====================== BACKGROUND DOTS ======================
    for (float i = 0.0; i < 240.0; i++) {
      float seed = i * 1.6180339 + 800.0;
      float x = fract(hash(seed) + time * 0.065) * 2.8 - 1.4;
      float y = hash(seed + 0.5) * 2.0 - 1.0;

      float dist = length(uv - vec2(x, y));
      float size = 0.0026 + hash(seed + 1.3) * 0.0034;
      float brightness = smoothstep(size, 0.0, dist) * (0.55 + hash(seed + 2.0) * 0.75);

      color += vec3(0.85, 0.92, 1.0) * brightness * 0.8;
    }

    // ====================== MAIN STREAKS ======================
    for (float i = 0.0; i < 520.0; i++) {
      float seed = i * 1.6180339;

      float y = hash(seed + 0.1) * 2.0 - 1.0 + sin(time * 0.11 + seed) * 0.016;

      // Speed: faster in middle
      float centerFactor = 1.0 - smoothstep(0.0, 0.32, vertDist);
      float speed = 0.7*(1.15 + hash(seed + 0.3) * 1.85) * (1.0 + centerFactor * 0.75);

      float phase = hash(seed + 0.2);
      float x = fract(phase + time * speed * 0.39) * 2.9 - 1.45;

      // === BLUR CONTROL ===
      // Middle horizontal strip (~24% height) = NO blur
      // Everything else = blurred + longer streaks
      float blurAmount = smoothstep(0.24, 0.7, vertDist);

      // Streak length
      float streakLength = 0.042 + blurAmount * 0.145;   // short in middle, long on sides
      float prevX = x - streakLength * speed;

      vec2 pos = vec2(x, y);
      vec2 prevPos = vec2(prevX, y);

      vec2 ab = pos - prevPos;
      vec2 ap = uv - prevPos;
      float abLen = length(ab);
      float t_seg = clamp(dot(ap, ab) / (abLen * abLen + 0.00001), 0.0, 1.0);
      vec2 closest = prevPos + t_seg * ab;
      float dist = length(uv - closest);

      float depth = fract(phase + time * speed * 0.21);
      float thickness = 0.0006 + depth * 0.0012 * (1.0 + blurAmount * 2.2);

      float brightness = smoothstep(thickness * 3.0, 0.0, dist)
                       * smoothstep(0.0, 0.34, depth)
                       * smoothstep(1.0, 0.36, depth);

      brightness *= 0.9 + hash(seed + 4.0) * 1.3;

      // Colors
      float colorType = hash(seed + 0.7);
      vec3 starColor;
      if (colorType < 0.33)      starColor = vec3(1.0, 0.57, 0.71);
      else if (colorType < 0.66) starColor = vec3(0.57, 0.81, 1.0);
      else                       starColor = vec3(0.96, 0.98, 1.0);

      color += starColor * brightness * (1.1 + speed * 0.38);
    }

    // Vignette + glow in middle strip
    float vignette = 1.0 - smoothstep(0.6, 2.2, length(uv));
    color *= vignette * 0.97;
    color += vec3(0.12, 0.17, 0.27) * (1.0 - vertDist) * 0.5;

    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(ctx: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
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
    console.error('[StarField] link error:', ctx.getProgramInfoLog(prog))
    return null
  }
  return prog
}

function resize(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  if (gl) gl.viewport(0, 0, canvas.width, canvas.height)
}

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

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas || import.meta.server) return

  gl = canvas.getContext('webgl')
  if (!gl) { console.error('[StarField] WebGL not supported'); return }

  program = createProgram(gl)
  if (!program) return

  gl.useProgram(program)

  const posLoc = gl.getAttribLocation(program, 'a_position')
  timeLocation = gl.getUniformLocation(program, 't')
  resolutionLocation = gl.getUniformLocation(program, 'r')

  const vertices = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1])
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