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

vec2 myTanh(vec2 x) {
  vec2 ex = exp(x);
  vec2 emx = exp(-x);
  return (ex - emx) / (ex + emx);
}

vec4 getBlackHole(vec2 p, float time) {
  vec4 o_bg = vec4(0.0);
  vec4 o_anim = vec4(0.0);

  {
    vec2 p_img = p * mat2(1.0, -1.0, 1.0, 1.0);
    vec2 l_val = myTanh(p_img * 5.0 + 2.0);
    l_val = min(l_val, l_val * 3.0);
    vec2 clamped = clamp(l_val, -2.0, 0.0);
    float diff_y = clamped.y - l_val.y;
    float safe_px = abs(p_img.x) < 0.001 ? 0.001 : p_img.x;
    float term = (0.1 - max(0.01 - dot(p_img, p_img) / 200.0, 0.0) * (diff_y / safe_px))
                 / abs(length(p_img) - 0.7);
    o_bg += vec4(term);
    o_bg *= max(o_bg, vec4(0.0));
  }

  {
    vec2 p_anim = p / 0.7;
    vec2 d = vec2(-1.0, 1.0);
    float denom = 0.1 + 5.0 / dot(5.0 * p_anim - d, 5.0 * p_anim - d);
    vec2 c = p_anim * mat2(1.0, 1.0, d.x / denom, d.y / denom);
    vec2 v = c;

    float angleOffset = log(length(v)) * 0.5 - time * 1.0 + sin(time * 0.5);
    v *= mat2(cos(angleOffset), -sin(angleOffset), sin(angleOffset), cos(angleOffset)) * 5.0;

    vec4 animAccum = vec4(0.0);
    for (int i = 1; i <= 9; i++) {
      float fi = float(i);
      animAccum += sin(vec4(v.x, v.y, v.y, v.x)) + vec4(1.0);
      v += 0.7 * sin(vec2(v.y, v.x) * fi + time) / fi + 0.5;
    }

    vec4 animTerm = 1.0 - exp(-exp(c.x * vec4(0.6, -0.4, -1.0, 0.0))
                      / animAccum
                      / (0.1 + 0.1 * pow(length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0, 2.0))
                      / (1.0 + 7.0 * exp(0.3 * c.y - dot(c, c)))
                      / (0.03 + abs(length(p_anim) - 0.7)) * 0.2);
    o_anim += animTerm;
  }

  return mix(o_bg, o_anim, 0.5) * 1.8;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
  float time = t * 0.7;
  float dist = length(uv * 0.6);

  vec4 finalColor = vec4(0.0);
  float angle = atan(uv.y, uv.x);

  vec3 domain = vec3(0.2, 0.03, 0.18);

  float layer1 = sin(dist * 12.0 - time * 2.2 + angle * 5.0);
  float layer2 = sin(dist * 20.0 + time * 3.5 - angle * 7.0);
  float layer3 = sin(dist * 35.0 - time * 5.0 + angle * 3.0);

  domain += vec3(0.45, 0.15, 0.85) * (layer1 * 0.5 + 0.5) * 0.5;
  domain += vec3(0.7, 0.25, 1.0)  * (layer2 * 0.5 + 0.5) * 0.35;
  domain += vec3(0.4, 0.1, 0.7)   * (layer3 * 0.5 + 0.5) * 0.25;
  domain += vec3(0.6, 0.3, 1.0) * (0.35 + 0.25 * sin(uv.x * 4.0 + uv.y * 3.0 - time));

  vec2 grid = fract(uv * 7.0 + time * 0.2);
  float gridLines = (1.0 - smoothstep(0.0, 0.1, min(grid.x, grid.y))) * 0.2;

  domain += vec3(0.5, 0.4, 0.9) * gridLines;
  finalColor.rgb = domain;

  float radius = 0.35;
  vec2 bhUV = uv / radius;

  float fixedAngle = -35.0 * 3.14159 / 180.0;
  mat2 rot = mat2(cos(fixedAngle), -sin(fixedAngle),
                  sin(fixedAngle),  cos(fixedAngle));
  bhUV = rot * bhUV;

  vec4 bh = getBlackHole(bhUV, time * 1.1);
  float mask = exp(-pow(dist / radius, 2.0) * 4.0);
  finalColor = mix(finalColor, bh, mask);
  finalColor.rgb += vec3(0.9, 0.4, 1.0) * 0.25;

  gl_FragColor = clamp(finalColor * 0.8, 0.0, 1.0);
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
