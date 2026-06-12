type Options = {
  fsSource: string;
  vsSource?: string;
};

export function useWebGLShader(options: Options) {
  const canvasRef = ref<HTMLCanvasElement | null>(null);

  const animationFrame = ref<number | null>(null);
  const startTime = performance.now();

  const vsSource =
    options.vsSource ??
    `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;

  let timeLocation: WebGLUniformLocation | null = null;
  let resolutionLocation: WebGLUniformLocation | null = null;
  let positionLocation: number | null = null;

  function compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
  ) {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
    const vShader = compileShader(gl, gl.VERTEX_SHADER, vs);
    const fShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return null;

    const prog = gl.createProgram();
    if (!prog) return null;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return null;
    }

    return prog;
  }

  function resizeCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth * dpr;
    const displayHeight = canvas.clientHeight * dpr;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl?.viewport(0, 0, displayWidth, displayHeight);
    }
  }

  function setupQuad() {
    if (!gl || !program) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  function renderLoop(canvas: HTMLCanvasElement) {
    function render() {
      if (!gl || !program || !timeLocation || !resolutionLocation) return;

      const time = (performance.now() - startTime) / 1000;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrame.value = requestAnimationFrame(render);
    }

    render();
  }

  onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas || import.meta.server) return;

    gl = canvas.getContext("webgl");
    if (!gl) return;

    program = createProgram(gl, vsSource, options.fsSource);
    if (!program) return;

    gl.useProgram(program);

    timeLocation = gl.getUniformLocation(program, "t");
    resolutionLocation = gl.getUniformLocation(program, "r");

    setupQuad();
    resizeCanvas(canvas);

    window.addEventListener("resize", () => resizeCanvas(canvas));

    renderLoop(canvas);
  });

  onUnmounted(() => {
    if (animationFrame.value) cancelAnimationFrame(animationFrame.value);
  });

  return { canvasRef };
}
