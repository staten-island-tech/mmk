import { defineStore } from "pinia";
import { ref } from "vue";

export const useShaderStore = defineStore("shader", () => {
  // WebGL objects
  const gl = ref<WebGLRenderingContext | null>(null);
  const program = ref<WebGLProgram | null>(null);
  const vertexBuffer = ref<WebGLBuffer | null>(null);

  // Locations
  const positionLocation = ref<number | null>(null);
  const timeLocation = ref<WebGLUniformLocation | null>(null);
  const resolutionLocation = ref<WebGLUniformLocation | null>(null);

  // Animations
  const animationFrame = ref<number | null>(null);
  const startTime = ref<number>(0);

  function resizeCanvas(canvas: HTMLCanvasElement) {
    if (!gl.value) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.value.viewport(0, 0, canvas.width, canvas.height);
  }

  function createShader(
    ctx: WebGLRenderingContext,
    type: number,
    source: string,
  ): WebGLShader | null {
    const shader = ctx.createShader(type);
    if (!shader) return null;

    ctx.shaderSource(shader, source);
    ctx.compileShader(shader);

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
      ctx.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function createProgram(
    ctx: WebGLRenderingContext,
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
  ): WebGLProgram | null {
    const vs = createShader(ctx, ctx.VERTEX_SHADER, vertexShaderSrc);
    const fs = createShader(ctx, ctx.FRAGMENT_SHADER, fragmentShaderSrc);
    if (!vs || !fs) return null;

    const prog = ctx.createProgram();
    if (!prog) return null;

    ctx.attachShader(prog, vs);
    ctx.attachShader(prog, fs);
    ctx.linkProgram(prog);

    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return null;

    return prog;
  }

  function setupVertexBuffer(vertices: Float32Array) {
    if (!gl.value) return null;

    const buf = gl.value.createBuffer();
    if (!buf) return null;

    gl.value.bindBuffer(gl.value.ARRAY_BUFFER, buf);
    gl.value.bufferData(gl.value.ARRAY_BUFFER, vertices, gl.value.STATIC_DRAW);
    vertexBuffer.value = buf;

    return buf;
  }

  return {
    gl,
    program,
    vertexBuffer,
    positionLocation,
    timeLocation,
    resolutionLocation,
    animationFrame,
    startTime,
    resizeCanvas,
    createShader,
    createProgram,
    setupVertexBuffer,
  };
});
