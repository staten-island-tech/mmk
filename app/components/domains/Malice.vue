<template>
  <div class="pointer-events-none z-0 fixed inset-0">
    <canvas ref="canvasRef" class="block w-full h-full" />
  </div>
</template>

<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null);
const shaderStore = useShaderStore();

const vsSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fsSource = `
precision mediump float;

uniform float t;
uniform vec2 r;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }

  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
  float time = t * 0.6;

  vec3 color = vec3(0.04, 0.0, 0.0);

  vec2 q = uv;
  q.x += fbm(q + time) * 0.15;
  q.y += fbm(q + time + 1.0) * 0.15;

  float dist = length(q);

  float wave = sin(dist * 12.0 - time * 3.5);
  wave = smoothstep(0.7, 1.0, wave) * exp(-dist * 1.5);

  float corePulse = 0.8 + 0.2 * sin(time * 5.0);
  float core = exp(-dist * 7.5) * corePulse;

  float angle = atan(q.y, q.x);
  float rays = sin(angle * 14.0 + time * 2.0 + fbm(q * 3.0) * 6.0);
  rays = smoothstep(0.4, 1.0, rays) * core * 1.5;

  vec3 coreColor = vec3(1.0, 0.95, 0.8) * core * 2.2;
  vec3 waveColor = vec3(0.9, 0.15, 0.05) * wave;
  vec3 rayColor = vec3(0.7, 0.0, 0.0) * rays;

  color += coreColor + waveColor + rayColor;

  float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv));
  color *= vignette;

  gl_FragColor = vec4(color, 1.0);
}
`;

function startRenderLoop(canvas: HTMLCanvasElement) {
  function render() {
    const { gl, program, timeLocation, resolutionLocation, startTime } =
      shaderStore;
    if (!gl || !program || !timeLocation || !resolutionLocation) return;

    const time = (performance.now() - startTime) / 1000;
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    shaderStore.animationFrame = requestAnimationFrame(render);
  }
  render();
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas || import.meta.server) return;

  const context = canvas.getContext("webgl");
  if (!context) return;
  shaderStore.gl = context;

  const prog = shaderStore.createProgram(context, vsSource, fsSource);
  if (!prog) return;
  shaderStore.program = prog;

  context.useProgram(prog);

  shaderStore.positionLocation = context.getAttribLocation(prog, "a_position");
  shaderStore.timeLocation = context.getUniformLocation(prog, "t");
  shaderStore.resolutionLocation = context.getUniformLocation(prog, "r");

  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  shaderStore.setupVertexBuffer(vertices);
  context.enableVertexAttribArray(shaderStore.positionLocation);
  context.vertexAttribPointer(
    shaderStore.positionLocation,
    2,
    context.FLOAT,
    false,
    0,
    0,
  );

  shaderStore.resizeCanvas(canvas);
  window.addEventListener("resize", () => shaderStore.resizeCanvas(canvas));

  shaderStore.startTime = performance.now();
  startRenderLoop(canvas);
});

onUnmounted(() => {
  if (shaderStore.animationFrame)
    cancelAnimationFrame(shaderStore.animationFrame);
});
</script>

<style scoped></style>
