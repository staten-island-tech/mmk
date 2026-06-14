<template>
  <div class="pointed-events-none z-0 fixed inset-0 bg-black">
    <canvas ref="canvasRef" class="block w-full h-full" />
  </div>
</template>

<script setup lang="ts">
defineExpose({
  THEME_BACKGROUND: "transparent",
  THEME_BACKGROUND_GRID: "#22294980",
  THEME_GROUND: "#1a1e3580",
  THEME_GROUND_GRID: "#464f7f50",
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
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
  float time = t * 2.45;

  vec3 color = vec3(0.0);
  float vertDist = abs(uv.y);

  float centerFactor = 1.0 - smoothstep(0.0, 0.32, vertDist);

  for (float i = 0.0; i < 60.0; i++) {
    float seed = i * 1.618 + 800.0;

    float r1 = hash(seed);
    float r2 = hash(seed + 1.3);
    float r3 = hash(seed + 2.0);
    float r4 = hash(seed + 0.5);

    float x = fract(r1 + time * 0.065) * 2.8 - 1.4;
    float y = r4 * 2.0 - 1.0;

    vec2 delta = uv - vec2(x, y);
    float dist2 = dot(delta, delta);

    float size = 0.0026 + r2 * 0.0034;

    float brightness = smoothstep(size * size, 0.0, dist2)
                     * (0.55 + r3 * 0.75);

    color += vec3(0.85, 0.92, 1.0) * brightness * 0.8;
  }

  for (float i = 0.0; i < 50.0; i++) {
    float seed = i * 1.618;

    float r1 = hash(seed);
    float r2 = hash(seed + 0.3);
    float r3 = hash(seed + 0.7);
    float r4 = hash(seed + 0.1);

    float y = r4 * 2.0 - 1.0 + sin(time * 0.11 + seed) * 0.016;

    float speed = 0.7 * (1.15 + r2 * 1.85) * (1.0 + centerFactor * 0.75);

    float phase = r3;
    float x = fract(phase + time * speed * 0.39) * 2.9 - 1.45;

    float blurAmount = clamp((vertDist - 0.24) / (0.7 - 0.24), 0.0, 1.0);
    float streakLength = 0.042 + blurAmount * 0.145;

    float prevX = x - streakLength * speed;

    vec2 prevPos = vec2(prevX, y);
    vec2 pos = vec2(x, y);

    vec2 ab = pos - prevPos;
    vec2 ap = uv - prevPos;

    float abLen2 = dot(ab, ab) + 0.00001;
    float t_seg = clamp(dot(ap, ab) / abLen2, 0.0, 1.0);

    vec2 closest = prevPos + t_seg * ab;

    float dist2 = dot(uv - closest, uv - closest);

    float depth = fract(phase + time * speed * 0.21);

    float thickness = 0.0006 + depth * 0.0012 * (1.0 + blurAmount * 2.2);

    float brightness =
        smoothstep(thickness * thickness * 9.0, 0.0, dist2) *
        smoothstep(0.0, 0.34, depth) *
        smoothstep(1.0, 0.36, depth);

    brightness *= 0.9 + r1 * 1.3;

    vec3 starColor =
        (r3 < 0.33) ? vec3(1.0, 0.57, 0.71) :
        (r3 < 0.66) ? vec3(0.57, 0.81, 1.0) :
                      vec3(0.96, 0.98, 1.0);

    color += starColor * brightness * (1.1 + speed * 0.38);
  }

  float vignette = 1.0 - smoothstep(0.6, 2.2, dot(uv, uv));

  color = color * vignette * 0.97
        + vec3(0.12, 0.17, 0.27) * (1.0 - vertDist) * 0.5;

  gl_FragColor = vec4(color, 1.0);
}
`;

const { canvasRef } = useWebGLShader({ fsSource, vsSource });
</script>

<style scoped></style>
