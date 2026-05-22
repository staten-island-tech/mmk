<template>
  <div
    class="relative h-full flex-1 flex flex-col items-center justify-center px-2 py-5 cursor-pointer overflow-hidden transition-transform duration-[120ms] ease-out select-none"
    :class="{ 'border-r border-white/[0.08]': !isLast }"
    :style="{ transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="$emit('action', config.id)"
    @keydown.enter="$emit('action', config.id)"
    @keydown.space.prevent="$emit('action', config.id)"
    tabindex="0"
    :aria-label="config.label"
    role="button"
  >
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full z-0" />

    <span
      class="absolute top-2 left-2 w-5 h-5 z-10 opacity-40"
      :style="{ borderTop: `2px solid ${config.accentColor}`, borderLeft: `2px solid ${config.accentColor}` }"
    />
    <span
      class="absolute bottom-2 right-2 w-5 h-5 z-10 opacity-40"
      :style="{ borderBottom: `2px solid ${config.accentColor}`, borderRight: `2px solid ${config.accentColor}` }"
    />

    <div
      class="relative z-10 w-[76px] h-[76px] rounded-full flex items-center justify-center mb-3 border-2 transition-transform duration-150"
      :style="{
        borderColor: config.accentColor,
        background: hexToRgba(config.accentColor, 0.1),
        transform: hovered ? 'scale(1.12)' : 'scale(1)',
      }"
    >
      <slot name="icon" />
    </div>

    <span
      class="relative z-10 text-[17px] font-bold tracking-[3px] uppercase mb-0.5"
      :style="{ color: config.textColor }"
    >{{ config.label }}</span>

    <span class="relative z-10 text-[9px] tracking-[2px] uppercase mb-4 text-white/35">
      {{ config.sub }}
    </span>

    <button
      class="relative z-10 px-5 py-2 text-[11px] font-bold tracking-[2px] uppercase border-none cursor-pointer transition-[filter] duration-[120ms]"
      :style="{
        background: config.accentColor,
        color: btnTextColor,
        clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
        filter: hovered ? 'brightness(1.3)' : 'brightness(1)',
      }"
      @click.stop="$emit('action', config.id)"
    >
      {{ config.btnText }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, computed, PropType } from 'vue'
import type { CardConfig } from './SmashDashboard.vue'


const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0,1); }`

const FRAG0 = `
precision mediump float;
uniform float t; uniform vec2 res; uniform float hov;
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
float n(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(.5,1.3);a*=.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/res; uv.y=1.-uv.y;
  float spd=0.22+hov*0.10;
  vec2 q=vec2(fbm(uv*1.8+t*spd),fbm(uv*1.8+t*spd+vec2(3.4,2.1)));
  float f=fbm(uv*2.2+2.0*q+t*spd*0.4);
  float b1=smoothstep(.36,.64,f+sin(uv.x*3.0+t*0.3)*0.06);
  float b2=smoothstep(.44,.36,fbm(uv*3.0+q+t*spd*0.6));
  vec3 dark=vec3(0.01,0.03,0.10);
  vec3 mid =vec3(0.05,0.16,0.50);
  vec3 lite=vec3(0.16,0.44,0.82);
  vec3 tip =vec3(0.42,0.68,0.95);
  vec3 col=dark;
  col=mix(col,mid, b1*0.65);
  col=mix(col,lite,b2*0.50);
  col=mix(col,tip, pow(b2,2.5)*0.30*(1.0+hov*0.25));
  col*=0.55+f*0.45;
  gl_FragColor=vec4(clamp(col,0.,1.),1.0);
}`

const FRAG1 = `
precision mediump float;
uniform float t; uniform vec2 res; uniform float hov;
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
float n(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(2,1)),h21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  for(int i=0;i<6;i++){v+=a*n(p);p=p*2.1+vec2(1.3,1.7);a*=.5-0.01*cos(a);}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/res; uv.y=1.-uv.y;
  float spd=0.10+hov*0.11;
  vec2 q=vec2(fbm(uv*2.2+t*spd),fbm(uv*2.2+vec2(5.2,1.3)+t*spd));
  float f=fbm(uv*2.8+2.2*q+t*spd*0.5);
  float crack=pow(max(0.,1.-abs(f-0.52)*13.0),2.5);
  vec3 cool=vec3(0.04,0.01,0.01);
  vec3 warm=vec3(0.24,0.05,0.01);
  vec3 hot =vec3(0.55,0.14,0.02);
  vec3 vein=vec3(0.82,0.40,0.08);
  vec3 col=mix(cool,warm,smoothstep(0.2,0.7,f));
  col=mix(col,hot,pow(f,2.0)*1.7);
  col+=vein*crack*(0.45+hov*0.30);
  col*=0.68+f*0.35;
  gl_FragColor=vec4(clamp(col,0.,1.),1.0);
}`

// 2 — Purple spiral vortex
const FRAG2 = `
precision mediump float;
uniform float t; uniform vec2 res; uniform float hov;
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
float n(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,-0.2)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);
}
void main(){
  vec2 uv=gl_FragCoord.xy/res; uv.y=1.-uv.y;
  vec2 c=uv-0.5;
  float dist=length(c);
  float angle=atan(c.y,c.x);
  float spd=0.50+hov*0.9;
  float rings=sin(dist*20.0-t*spd*2.6+angle*1.5)*0.5+0.5;
  float twist=sin(angle*5.0+dist*7.0-t*spd*3.2)*0.5+01.2;
  float grain=n(uv*6.0+t*0.07)*0.90;
  float pattern=rings*0.5+twist*0.35+grain;
  float fade=1.0-smoothstep(0.0,0.52,dist);
  float core=exp(-dist*3.2)*(0.50+hov*0.25);
  vec3 void_=vec3(0.02,0.01,0.06);
  vec3 deep=vec3(0.10,0.03,0.26);
  vec3 mid =vec3(0.28,0.08,0.62);
  vec3 rim =vec3(0.50,0.28,0.85);
  vec3 col=mix(void_,deep,pattern*fade*0.85);
  col=mix(col,mid,pow(pattern,1.8)*fade*0.55);
  col=mix(col,rim,pow(twist,3.0)*fade*0.28*(1.0+hov*0.18));
  col+=mid*core;
  col*=0.60+pattern*0.45;
  gl_FragColor=vec4(clamp(col,0.,1.),1.0);
}`

const FRAG3 = `
precision mediump float;
uniform float t; uniform vec2 res; uniform float hov;
float hf(float n){ return fract(sin(n)*43758.5); }
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
float n2(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);
}
void main(){
  vec2 uv=gl_FragCoord.xy/res; uv.y=1.-uv.y;
  float cols=16.0;
  float cid=floor(uv.x*cols);
  float cx=fract(uv.x*cols);
  float spd=0.32+hf(cid)*0.45+hov*0.28;
  float off=hf(cid+5.1)*8.0;
  float sy=fract(uv.y+t*spd+off);
  float head=exp(-sy*-4.2)*smoothstep(0.42,0.0,sy);
  float trail=exp(-sy*2.0)*0.55;
  float ch=floor(sy/0.07);
  float on=step(0.35, h21(vec2(cid, ch+floor(t*1.4+off))));
  float gx=exp(-pow(cx-0.5,2.0)*13.0);
  float intensity=(head*1.6+trail*0.30)*on*gx;
  float bg=n2(uv*5.0+t*0.04)*0.030*gx;
  vec3 dark=vec3(0.0,0.04,0.02);
  vec3 mid =vec3(0.03,0.24,0.10);
  vec3 lite=vec3(0.14,0.60,0.26);
  vec3 tip =vec3(0.44,0.88,0.54);
  vec3 col=dark+mid*trail*0.28*on*gx+lite*head*on*gx*0.80;
  col+=tip*intensity*0.28*(1.0+hov*0.35);
  col+=vec3(0.05,bg*2.5,bg)*0.5;
  col*=0.65+intensity*0.90;
  gl_FragColor=vec4(clamp(col,0.,1.),1.0);
}`

const FRAGS = [FRAG0, FRAG1, FRAG2, FRAG3]


interface GLContext {
  gl: WebGLRenderingContext
  uT: WebGLUniformLocation | null
  uR: WebGLUniformLocation | null
  uH: WebGLUniformLocation | null
}

function buildGL(canvas: HTMLCanvasElement, fragSrc: string): GLContext | null {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
  if (!gl) return null

  function makeShader(type: number, src: string) {
    const s = gl!.createShader(type)!
    gl!.shaderSource(s, src)
    gl!.compileShader(s)
    return s
  }

  const prog = gl.createProgram()!
  gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, fragSrc))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  return {
    gl,
    uT: gl.getUniformLocation(prog, 't'),
    uR: gl.getUniformLocation(prog, 'res'),
    uH: gl.getUniformLocation(prog, 'hov'),
  }
}


export default defineComponent({
  name: 'DshCard',
  props: {
    config: { type: Object as PropType<CardConfig>, required: true },
    index:  { type: Number, required: true },
    isLast: { type: Boolean, default: false },
  },
  emits: ['action'],

  setup(props) {
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const hovered   = ref(false)

    let glCtx: GLContext | null = null
    let rafId = 0
    const start = performance.now()

    function tick() {
      if (!glCtx) return
      const { gl, uT, uR, uH } = glCtx
      const t = (performance.now() - start) / 1000
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.uniform1f(uT, t)
      gl.uniform2f(uR, gl.canvas.width, gl.canvas.height)
      gl.uniform1f(uH, hovered.value ? 1 : 0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(tick)
    }

    onMounted(() => {
      const canvas = canvasRef.value
      if (!canvas) return
      const parent = canvas.parentElement!
      canvas.width  = parent.clientWidth  || 170
      canvas.height = parent.clientHeight || 420
      glCtx = buildGL(canvas, FRAGS[props.config.shader])
      if (glCtx) tick()
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(rafId)
    })

    // Recompute a dark version of accentColor for button text
    const btnTextColor = computed(() => {
      // map accent to very dark variant for legibility
      const map: Record<string, string> = {
        '#4a9eff': '#020d1f',
        '#ff4a4a': '#1f0202',
        '#b44aff': '#160223',
        '#4aff8c': '#011508',
      }
      return map[props.config.accentColor] ?? '#000'
    })

    function hexToRgba(hex: string, alpha: number): string {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha})`
    }

    return { canvasRef, hovered, btnTextColor, hexToRgba }
  },
})
</script>