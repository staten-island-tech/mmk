<template>
  <div class="pointed-events-none z-0 fixed inset-0 bg-black">
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

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float star(vec2 uv, float size, float sharpness) {
  float d = length(uv);
  float core = smoothstep(size, size * 0.1, d);
  float spike1 = exp(-abs(uv.x) * sharpness) * exp(-abs(uv.y) * sharpness * 6.0);
  float spike2 = exp(-abs(uv.y) * sharpness) * exp(-abs(uv.x) * sharpness * 6.0);
  float spikes = max(spike1, spike2) * smoothstep(size * 4.0, 0.0, d);
  float halo = exp(-d * sharpness * 0.4) * 0.25;
  return clamp(core + spikes * 0.6 + halo, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 aspect = vec2(r.x / r.y, 1.0);

  float time = t;

  vec3 color = vec3(0.0);

  {
    float speed   = 0.55;
    float count   = 180.0;
    float sizeBase = 0.003;
    vec3  tint    = vec3(0.75, 0.88, 1.0);

    for (float i = 0.0; i < 30.0; i++) {
      float seed  = i * 1.7324;
      float xSeed = hash(seed);
      float ySeed = hash(seed + 0.5);
      float vx    = (hash(seed + 1.1) - 0.3) * speed;
      float vy    = (hash(seed + 2.2) - 0.5) * speed * 0.25;
      float phase = hash(seed + 3.3);

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

  {
    float speed   = 0.28;
    float sizeBase = 0.0055;
    vec3  tint    = vec3(1.0, 0.96, 0.88);

    for (float i = 0.0; i < 30.0; i++) {
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

  {
    float speed   = 1.4;
    float sizeBase = 0.0018;
    vec3  tint    = vec3(0.6, 0.75, 1.0);

    for (float i = 0.0; i < 20.0; i++) {
      float seed  = i * 2.3456 + 3000.0;
      float xSeed = hash(seed);
      float ySeed = hash(seed + 0.5);
      float vx    = (hash(seed + 1.1) * 0.7 + 0.3) * speed;
      float vy    = (hash(seed + 2.2) - 0.5) * speed * 0.08;
      float phase = hash(seed + 3.3);

      vec2 pos;
      pos.x = fract(xSeed + vx * time + phase);
      pos.y = fract(ySeed + vy * time);

      vec2 delta = (uv - pos) * aspect;
      delta.x *= 0.15; // squish x → horizontal streak

      float sz    = sizeBase * (0.5 + hash(seed + 4.4));
      float sharp = 200.0 / sz;
      float b     = star(delta, sz, sharp) * 0.7;

      color += tint * b;
    }
  }

  vec2 centered = uv - 0.5;
  float vignette = 1.0 - dot(centered, centered) * 1.2;
  vec3 bg = vec3(0.01, 0.01, 0.025) * vignette;

  gl_FragColor = vec4(bg + color, 1.0);
}
`;

let handleResize: () => void;

function startRenderLoop(canvas: HTMLCanvasElement) {
  function render() {
    const { gl, program, timeLocation, resolutionLocation, startTime } =
      shaderStore;
    if (!gl || !program || !timeLocation || !resolutionLocation) return;

    const time = (performance.now() - startTime) / 1000;
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    shaderStore.animationFrame = requestAnimationFrame(render);
  }
  render();
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const gl = canvas.getContext("webgl");
  if (!gl) return;
  shaderStore.gl = gl;

  const program = shaderStore.createProgram(gl, vsSource, fsSource);
  if (!program) return;
  shaderStore.program = program;
  gl.useProgram(program);

  shaderStore.positionLocation = gl.getAttribLocation(program, "a_position");
  shaderStore.timeLocation = gl.getUniformLocation(program, "t");
  shaderStore.resolutionLocation = gl.getUniformLocation(program, "r");

  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  shaderStore.setupVertexBuffer(vertices);
  gl.enableVertexAttribArray(shaderStore.positionLocation);
  gl.vertexAttribPointer(
    shaderStore.positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  );

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  handleResize = resize;
  resize();
  window.addEventListener("resize", handleResize);

  shaderStore.startTime = performance.now();
  startRenderLoop(canvas);
});

onUnmounted(() => {
  if (shaderStore.animationFrame)
    cancelAnimationFrame(shaderStore.animationFrame);
  if (handleResize) window.removeEventListener("resize", handleResize);
});
</script>

<style scoped></style>
