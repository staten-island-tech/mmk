<template>
  <div class="domain-fullscreen">
    <canvas ref="canvasRef"></canvas>
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

let blackHoleShader = ''

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
function buildFS() {
  return `
    precision mediump float;

    uniform float t;
    uniform vec2 r;

    ${blackHoleShader}

    void main() {

      // 🌌 FULL SCREEN SPACE (DO NOT SCALE THIS)
      vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
     
      float time = t * 0.7;
      float dist = length(uv * 0.6);

      vec4 finalColor = vec4(0.0);

      float angle = atan(uv.y, uv.x);

      // 🌌 BACKGROUND (FULL SCREEN)
      vec3 domain = vec3(0.08, 0.02, 0.22);

      float layer1 = sin(dist * 12.0 - time * 2.2 + angle * 5.0);
      float layer2 = sin(dist * 20.0 + time * 3.5 - angle * 7.0);
      float layer3 = sin(dist * 35.0 - time * 5.0 + angle * 3.0);

      domain += vec3(0.45, 0.15, 0.85) * (layer1 * 0.5 + 0.5) * 0.8;
      domain += vec3(0.7, 0.25, 1.0) * (layer2 * 0.5 + 0.5) * 0.6;
      domain += vec3(0.4, 0.1, 0.7) * (layer3 * 0.5 + 0.5) * 0.4;

domain += vec3(0.6, 0.3, 1.0) * (0.6 + 0.4 * sin(dist * 2.0 - time));
      vec2 grid = fract(uv * 7.0 + time * 0.2);
      float gridLines = (1.0 - smoothstep(0.0, 0.1, min(grid.x, grid.y))) * 0.35;
      domain += vec3(0.5, 0.4, 0.9) * gridLines * (1.0 - dist * 0.3);

      finalColor.rgb = domain;

      // ⚫ BLACK HOLE (SMALL CORE ONLY)
      float radius = 0.35;

      vec2 bhUV = uv / radius;
      vec4 bh = getBlackHole(bhUV, time * 1.1);

      // 🌀 GRAVITY MASK (fixes "everything shrinks" bug)
      float mask = exp(-pow(dist / radius, 2.0) * 4.0);

      finalColor = mix(finalColor, bh, mask);

      // ✨ Rim glow
      float rim = exp(-dist * 3.5);
      finalColor.rgb += vec3(0.9, 0.4, 1.0) * rim * 0.6;

      gl_FragColor = clamp(finalColor * 1.15, 0.0, 1.0);
    }
  `
}

// -------------------------
// Shader utils
// -------------------------
function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = createShader(gl, gl.FRAGMENT_SHADER, buildFS())

  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }

  return program
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
    if (!gl || !timeLocation || !resolutionLocation) return

    const time = (performance.now() - startTime) / 1000

    gl.uniform1f(timeLocation, time)
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animationFrame = requestAnimationFrame(render)
  }

  render()
}

// -------------------------
// Init
// -------------------------
onMounted(async () => {
  const canvas = canvasRef.value
  if (!canvas) return

  if (import.meta.server) return

  const res = await fetch('/shaders/blackHole.glsl')
  blackHoleShader = await res.text()

  if (!blackHoleShader) return

  gl = canvas.getContext('webgl')
  if (!gl) return

  program = createProgram(gl)
  if (!program) return

  gl.useProgram(program)

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  timeLocation = gl.getUniformLocation(program, 't')
  resolutionLocation = gl.getUniformLocation(program, 'r')

  const vertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ])

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  resize(canvas)

  startTime = performance.now()

  startRenderLoop(canvas)
})

// -------------------------
// Cleanup
// -------------------------
onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.domain-fullscreen {
  position: fixed;
  inset: 0;
  background: black;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>