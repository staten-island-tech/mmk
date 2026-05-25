<template>
  <div
    class="cursor-pointer select-none overflow-visible relative flex-1 h-full border-none transition-transform duration-200"
    :style="{
      '--accent': props.config.accentColor,
      perspective: '1450px',
    }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @mousedown="active = true"
    @mouseup="active = false"
    @click="$emit('action', props.config.action)"
  >
    <div
      class="absolute inset-0 w-full h-full transform-gpu transition-transform duration-200"
      :style="{
        transform: active
          ? 'scale(0.8)'
          : hovered
            ? 'rotateX(10deg) rotateY(-10deg) scale(0.95)'
            : 'none',
      }"
    >
      <canvas
        ref="canvasRef"
        class="absolute inset-0 h-full w-full outline-4 outline-double outline-card-border bg-slate-500 brightness-75 transition-box-shadow duration-200"
        :class="hovered && !active ? 'shadow-transparent-lg' : 'none'"
      />

      <div
        class="z-10 flex flex-col justify-center items-center relative px-3 py-5 h-full"
      >
        <!--
          The icon slot for the card.
          Use `<template #icon> ... </template>` to define this slot.
        -->
        <div
          class="flex justify-center items-center rounded-full mb-6 w-24 h-24 border-2 border-[var(--accent)] transition-transform duration-200"
          :class="hovered ? 'scale-110' : 'scale-100'"
        >
          <slot name="icon" />
        </div>

        <!--
          The card title.
          Defined in the card configuration.
        -->
        <div
          class="mb-1 text-center text-lg text-[var(--accent)] tracking-widest font-bold uppercase opacity-80 brightness-125"
        >
          {{ props.config.title }}
        </div>

        <!--
          The card subtitle.
          Defined in the card configuration.
        -->
        <div
          class="mb-6 text-center text-xs tracking-widest uppercase text-white/80"
        >
          {{ props.config.subtitle }}
        </div>

        <!--
          The card button text.
          Defined in the card configuration.
        -->
        <button
          class="px-5 py-2 text-sm font-bold uppercase tracking-[2px] bg-[var(--accent)] transition-all duration-200"
          :class="hovered ? 'brightness-125' : 'brightness-100'"
          :style="{
            color: buttonLabelColor,
            clipPath:
              'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
          }"
          @click.stop="$emit('action', props.config.action)"
        >
          {{ config.buttonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  config: {
    action: string;
    title: string;
    subtitle: string;
    buttonLabel: string;
    accentColor: string;
    shader: number;
  };
}>();
defineEmits(["action"]);

const hovered = ref(false);
const active = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;

    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * a[0]! + 0.7152 * a[1]! + 0.0722 * a[2]!;
}

function contrast(l1: number, l2: number) {
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
}

const buttonLabelColor = computed(() => {
  const { r, g, b } = hexToRgb(props.config.accentColor);

  const bgLum = luminance(r, g, b);

  const whiteContrast = contrast(bgLum, 1);
  const blackContrast = contrast(bgLum, 0);

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
});

const VERT = `
attribute vec2 p;
void main() {
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const COMMON = `
precision mediump float;

uniform float t;
uniform vec2 res;
uniform float hov;

vec2 uvWorld(vec2 fragCoord, vec2 resolution) {
  vec2 centered = fragCoord - resolution * 0.5;
  float scale = min(resolution.x, resolution.y);
  return centered / scale;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
  float value = 0.0;
  float amp = 0.5;

  for (int i = 0; i < 5; i++) {
    value += noise(p) * amp;
    p = p * 2.0 + vec2(1.7, 9.2);
    amp *= 0.5;
  }

  return value;
}
`;

const SHADERS: readonly string[] = [
  COMMON +
    `
void main() {
  vec2 uv = uvWorld(gl_FragCoord.xy, res);
  float speed = 0.22 + hov * 0.1;

  vec2 flow = vec2(
    fbm(uv * 1.8 + t * speed),
    fbm(uv * 1.8 + t * speed + vec2(3.4, 2.1))
  );

  float field = fbm(uv * 2.2 + flow * 2.0 + t * speed * 0.4);
  float softLayer = smoothstep(0.36, 0.64, field);
  float detailLayer = smoothstep(0.44, 0.36, fbm(uv * 3.0 + flow));

  vec3 dark = vec3(0.01, 0.03, 0.10);
  vec3 mid = vec3(0.05, 0.16, 0.50);
  vec3 lite = vec3(0.16, 0.44, 0.82);
  vec3 glow = vec3(0.42, 0.68, 0.95);

  vec3 color = dark;
  color = mix(color, mid, softLayer * 0.65);
  color = mix(color, lite, detailLayer * 0.5);
  color += glow * pow(detailLayer, 2.5) * 0.3;

  gl_FragColor = vec4(color, 1.0);
}
`,
  COMMON +
    `
void main() {
  vec2 uv = uvWorld(gl_FragCoord.xy, res);
  float speed = 0.12 + hov * 0.12;

  vec2 warp = vec2(
    fbm(uv * 2.0 + t * speed),
    fbm(uv * 2.0 - t * speed + 4.0)
  );

  vec2 p = uv * 3.0 + warp * 1.2;

  float baseNoise = fbm(p + t * speed * 0.5);
  float detailNoise = fbm(p * 1.8 - t * speed * 0.25);

  float lava = smoothstep(0.25, 0.85, baseNoise);
  float veins = 1.0 - abs(detailNoise - 0.5) * 2.0;
  veins = smoothstep(0.55, 0.92, veins);
  veins *= veins;

  vec3 dark = vec3(0.03, 0.01, 0.01);
  vec3 warm = vec3(0.2, 0.04, 0.01);
  vec3 hot = vec3(0.75, 0.18, 0.02);
  vec3 glow = vec3(1.0, 0.55, 0.08);

  vec3 color = mix(dark, warm, lava);
  color = mix(color, hot, pow(lava, 1.6));
  color += glow * veins * (0.28 + hov * 0.22);

  gl_FragColor = vec4(color, 1.0);
}
`,
  COMMON +
    `
void main() {
  vec2 uv = uvWorld(gl_FragCoord.xy, res);
  float speed = 0.06 + hov * 0.05;

  vec2 flow = vec2(
    fbm(uv * 1.2 + t * speed),
    fbm(uv * 1.2 - t * speed)
  );

  vec2 p = uv + flow * 0.8;

  float neb = fbm(p * 2.0 + flow * 1.5);
  float stars = smoothstep(0.7, 1.0, fbm(p * 10.0));
  float spark = pow(fbm(p * 22.0 - t * 0.1), 7.0);

  float vignette = smoothstep(1.2, 0.2, length(uv));

  vec3 bg = vec3(0.005, 0.002, 0.01);
  vec3 deep = vec3(0.04, 0.02, 0.10);
  vec3 purple = vec3(0.25, 0.1, 0.45);
  vec3 star = vec3(0.85, 0.8, 1.0);

  vec3 col = bg * vignette;
  col += deep * neb * 0.8;
  col += purple * neb * neb * 1.2;
  col += star * stars * 0.9;
  col += star * spark * 0.6;
  col += vec3(0.01, 0.005, 0.02);

  gl_FragColor = vec4(col, 1.0);
}
`,
  COMMON +
    `
void main() {
  vec2 uv = uvWorld(gl_FragCoord.xy, res);
  float speed = 0.22 + hov * 0.15;

  vec2 flow = vec2(
    fbm(uv * 1.8 + t * speed),
    fbm(uv * 1.8 - t * speed)
  );

  vec2 p = uv + flow * 0.7;

  float y = p.y * 4.0 + t * speed * 2.5;
  float lane = fbm(vec2(p.x * 3.0, y * 0.5));
  float rain = smoothstep(0.35, 0.95, lane);

  float trail = smoothstep(0.25, 0.85, fbm(vec2(p.x * 6.0, y - 1.2)));
  float drops = pow(lane, 4.0);

  float flicker = smoothstep(0.4, 0.9, fbm(vec2(p.x * 12.0, t * 0.8)));

  vec3 dark = vec3(0.0, 0.02, 0.01);
  vec3 mid = vec3(0.05, 0.8, 0.25);
  vec3 neon = vec3(0.2, 1.0, 0.55);

  vec3 col = dark;
  col += mid * rain * 0.9;
  col += neon * drops * 1.1;
  col += neon * trail * 0.5;
  col += neon * flicker * 0.2;
  col += vec3(0.0, 0.03, 0.01);

  gl_FragColor = vec4(col, 1.0);
}
`,
];

interface GLContext {
  gl: WebGLRenderingContext;
  uT: WebGLUniformLocation | null;
  uR: WebGLUniformLocation | null;
  uH: WebGLUniformLocation | null;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);

  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }

  return s;
}

function buildGL(canvas: HTMLCanvasElement, frag: string): GLContext | null {
  const gl = canvas.getContext("webgl", {
    antialias: true,
    alpha: false,
  });

  if (!gl) return null;

  const prog = gl.createProgram()!;

  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag));

  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const loc = gl.getAttribLocation(prog, "p");

  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    uT: gl.getUniformLocation(prog, "t"),
    uR: gl.getUniformLocation(prog, "res"),
    uH: gl.getUniformLocation(prog, "hov"),
  };
}

let glCtx: GLContext | null = null;
let raf = 0;
let ro: ResizeObserver | null = null;

const start = performance.now();

function render() {
  if (!glCtx) return;

  const { gl, uT, uR, uH } = glCtx;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(uT, (performance.now() - start) / 1000);
  gl.uniform2f(uR, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(uH, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  raf = requestAnimationFrame(render);
}

onMounted(async () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const parent = canvas.parentElement!;
  const dpr = window.devicePixelRatio || 1;

  const resize = () => {
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  };

  resize();
  ro = new ResizeObserver(resize);
  ro.observe(parent);

  const frag = SHADERS[props.config.shader ?? 0] ?? SHADERS[0]!;

  glCtx = buildGL(canvas, frag);
  render();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  ro?.disconnect();
});
</script>

<style scoped></style>
