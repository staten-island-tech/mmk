<template>
  <div class="pointer-events-none z-0 inset-0 bg-black w-full h-full">
    <canvas ref="canvasRef" class="block w-full h-full" />
  </div>
</template>

<script setup lang="ts">
defineExpose({
  THEME_BACKGROUND: "transparent",
  THEME_BACKGROUND_GRID: "#44444460",
  THEME_GROUND: "#080e2880",
  THEME_GROUND_GRID: "#41496d80",
});

const vsSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fsSource = `
precision highp float;

uniform float t;
uniform vec2 r;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
  float time = t * 2.4;
  vec3 color = vec3(0.0);

  float centerDist = length(uv);

  for (float i = 0.0; i < 100.0; i++) {
    float seed = i * 1.6180339;

    float y = hash(seed + 0.1) * 2.0 - 1.0 + sin(time * 0.12 + seed) * 0.018;

    float centerFactor = 1.0 - smoothstep(0.0, 0.5, centerDist);
    float speed = (1.1 + hash(seed + 0.3) * 1.9) * (1.0 + centerFactor * 0.65);

    float phase = hash(seed + 0.2);
    float x = fract(phase + time * speed * 0.38) * 2.9 - 1.45;

    float blurAmount = smoothstep(0.24, 0.9, centerDist);
    float streakLength = 0.038 + blurAmount * 0.11;
    float prevX = x - streakLength * speed;

    vec2 pos = vec2(x, y);
    vec2 prevPos = vec2(prevX, y);

    vec2 ab = pos - prevPos;
    vec2 ap = uv - prevPos;
    float abLen = length(ab);
    float t_seg = clamp(dot(ap, ab) / (abLen * abLen + 0.00001), 0.0, 1.0);
    vec2 closest = prevPos + t_seg * ab;
    float dist = length(uv - closest);

    float depth = fract(phase + time * speed * 0.2);
    float thickness = 0.00055 + depth * 0.0011 * (1.0 + blurAmount * 1.8);

    float brightness = smoothstep(thickness * 3.0, 0.0, dist)
                     * smoothstep(0.0, 0.32, depth)
                     * smoothstep(1.0, 0.38, depth);

    brightness *= 0.85 + hash(seed + 4.0) * 1.3;

    float colorType = hash(seed + 0.7);
    vec3 starColor;
    if (colorType < 0.33)      starColor = vec3(1.0, 0.58, 0.72);
    else if (colorType < 0.66) starColor = vec3(0.58, 0.82, 1.0);
    else                       starColor = vec3(0.96, 0.98, 1.0);

    color += starColor * brightness * (1.05 + speed * 0.35);
  }

  float vignette = 1.0 - smoothstep(0.55, 2.1, centerDist);
  color *= vignette * 0.97;
  color += vec3(0.12, 0.18, 0.28) * exp(-centerDist * 4.0) * 0.35;

  gl_FragColor = vec4(color, 1.0);
}
`;

const { canvasRef } = useWebGLShader({ fsSource, vsSource });
</script>

<style scoped></style>
