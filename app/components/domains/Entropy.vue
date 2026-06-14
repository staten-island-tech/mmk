<template>
  <div class="pointed-events-none z-0 fixed inset-0 bg-black">
    <canvas ref="canvasRef" class="block w-full h-full" />
  </div>
</template>

<script setup lang="ts">
defineExpose({
  THEME_BACKGROUND: "transparent",
  THEME_BACKGROUND_GRID: "#1c234780",
  THEME_GROUND: "#080d2880",
  THEME_GROUND_GRID: "#4f598950",
});

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

float noise(vec2 p) {
  return hash(p.x * 127.1 + p.y * 311.7);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 toroidalDelta(vec2 a, vec2 b) {
  vec2 d = a - b;
  d -= floor(d + 0.5);
  return d;
}

float particle(vec2 delta, float size) {
  float d = dot(delta, delta);
  float core = exp(-d / (size * size * 0.3)) * 1.5;
  float glow = exp(-d / (size * size * 0.8)) * 0.3;
  return core + glow;
}

vec3 particleColor(float h) {
  return mix(
    vec3(0.6, 0.75, 1.0),
    vec3(1.0, 0.85, 0.7),
    h
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  vec2 aspect = vec2(r.x / r.y, 1.0);
  float time = t;
  vec3 color = vec3(0.0);
  vec2 centered = uv - 0.5;
  float vignette = 1.0 - dot(centered, centered) * 0.8;

  vec2 bgUV = uv * 3.0;
  float n1 = smoothNoise(bgUV * 0.3 + time * 0.02);
  float n2 = smoothNoise(bgUV * 0.7 - time * 0.015 + 100.0);
  float n3 = smoothNoise(bgUV * 1.5 + time * 0.01 + 200.0);
  
  vec3 deepBlue = vec3(0.05, 0.06, 0.1);
  vec3 darkPurple = vec3(0.06, 0.05, 0.09);
  vec3 darkTeal = vec3(0.04, 0.07, 0.085);
  vec3 midnightBlue = vec3(0.05, 0.055, 0.095);
  vec3 darkIndigo = vec3(0.055, 0.05, 0.09);
  
  vec3 bg = mix(deepBlue, darkPurple, n1 * 0.5);
  bg = mix(bg, darkTeal, n2 * 0.35);
  bg = mix(bg, midnightBlue, n3 * 0.3);
  bg = mix(bg, darkIndigo, n1 * n2 * 0.25);
  bg *= 0.9 + n3 * 0.2;
  bg *= vignette;

  for (float i = 0.0; i < 30.0; i++) {
    float seed = i * 1.73;
    vec2 basePos = vec2(hash(seed), hash(seed + 1.0));
    vec2 pos = basePos + time * 0.01;
    vec2 delta = toroidalDelta(uv, pos) * aspect;
    float h = hash(seed + 2.0);
    float size = 0.0015;
    float b = particle(delta, size);
    float blink = 0.5 + 0.5 * sin(time * 3.0 + h * 10.0);
    blink = pow(blink, 2.0) * 0.8 + 0.2;
    color += particleColor(h) * b * blink;
  }

  for (float i = 0.0; i < 20.0; i++) {
    float seed = i * 2.11 + 100.0;
    vec2 basePos = vec2(hash(seed), hash(seed + 1.0));
    vec2 pos = basePos + time * 0.015;
    vec2 delta = toroidalDelta(uv, pos) * aspect;
    float h = hash(seed + 2.0);
    float size = 0.0025;
    float b = particle(delta, size);
    float blink = 0.5 + 0.5 * sin(time * 2.5 + h * 8.0);
    blink = pow(blink, 1.5) * 0.7 + 0.3;
    color += particleColor(h) * b * blink;
  }

  for (float i = 0.0; i < 12.0; i++) {
    float seed = i * 3.7 + 500.0;
    vec2 basePos = vec2(hash(seed), hash(seed + 1.0));
    vec2 pos = basePos + time * 0.005;
    vec2 delta = toroidalDelta(uv, pos) * aspect;
    float h = hash(seed + 2.0);
    float size = 0.0035;
    float b = particle(delta, size);
    float blink = 0.6 + 0.4 * sin(time * 1.5 + h * 6.0);
    color += particleColor(h) * b * blink * 0.8;
  }

  for (float i = 0.0; i < 15.0; i++) {
    float seed = i * 5.0 + 900.0;
    vec2 basePos = vec2(hash(seed), hash(seed + 1.0));
    vec2 pos = basePos + time * 0.03;
    vec2 delta = toroidalDelta(uv, pos) * aspect;
    float size = 0.0012;
    float b = particle(delta, size);
    float blink = 0.4 + 0.6 * sin(time * 4.0 + seed * 5.0);
    color += vec3(0.7, 0.8, 1.0) * b * blink;
  }

  color = 1.0 - exp(-color * 1.8);
  color *= vignette;

  gl_FragColor = vec4(color + bg, 1.0);
}
`;

const { canvasRef } = useWebGLShader({ fsSource, vsSource });
</script>

<style scoped></style>
