"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface HeroShaderProps {
  /** Base void background hex (default CANON #05030a) */
  colorVoid?: string;
  /** Primary warm editorial highlight hex (default CANON Zion Gold #d4af37) */
  colorGold?: string;
  /** Precision signal hex (default CANON Signal Cyan #4de8e0) */
  colorCyan?: string;
  /** Subtle ember accent hex (default CANON Neon Crimson #ff073a) */
  colorEmber?: string;
  /** Overall luminosity multiplier (0.15 - 1.0) so foreground text stays WCAG AAA */
  intensity?: number;
  className?: string;
  style?: CSSProperties;
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/**
 * Shader editorial propio "Belentani Folio & Signal":
 * Pliegues de luz laminar inspirados en papel verjurado y retícula óptica sobre negro vacío (#05030a),
 * con un único triángulo a pantalla completa (cero sobredibujo diagonal) para 60 fps constantes.
 */
const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform vec3 u_void;
uniform vec3 u_gold;
uniform vec3 u_cyan;
uniform vec3 u_ember;
uniform float u_intensity;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    sum += amp * valueNoise(p);
    p = rot * p * 2.03;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 res = max(u_res, vec2(1.0));
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  vec2 ptr = (u_pointer - 0.5) * 0.28;
  float t = u_time * 0.09;

  // Campo laminar tipo pliego editorial deformado suavemente
  vec2 q = vec2(
    fbm(uv * 1.45 + vec2(t * 0.7, -t * 0.45)),
    fbm(uv * 1.45 + vec2(3.1, 1.7) + vec2(-t * 0.4, t * 0.55))
  );
  vec2 warped = uv + 0.32 * (q - 0.5) + ptr * 0.45;

  // Líneas de contorno suaves estilo marca de agua / pliego tipográfico
  float contour = sin((warped.x * 5.2 - warped.y * 3.4) + q.x * 4.2);
  float silk = smoothstep(0.15, 0.98, 0.5 + 0.5 * contour);

  // Focos periféricos controlados para proteger contraste del texto principal
  float distGold = length(uv - vec2(0.36, 0.22) - ptr * 0.35);
  float distCyan = length(uv - vec2(-0.42, -0.24) + ptr * 0.25);
  float distEmber = length(uv - vec2(0.12, -0.38));

  float goldMask = smoothstep(1.05, 0.05, distGold) * silk;
  float cyanMask = smoothstep(1.10, 0.08, distCyan) * (1.0 - silk * 0.45);
  float emberMask = smoothstep(0.85, 0.0, distEmber) * q.y * 0.55;

  vec3 col = u_void;
  col += u_gold * (goldMask * 0.24 * u_intensity);
  col += u_cyan * (cyanMask * 0.16 * u_intensity);
  col += u_ember * (emberMask * 0.12 * u_intensity);

  // Filigrana fina de folio en crestas
  float crest = pow(max(0.0, 1.0 - abs(contour)), 7.0);
  col += mix(u_gold, u_cyan, clamp(uv.x + 0.5, 0.0, 1.0)) * crest * 0.075 * u_intensity;

  // Dithering sutil para evitar banding en monitores 8-bit
  float grain = (hash21(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * 0.012;
  col = clamp(col + grain, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function hexToNormalizedRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return fallback;
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
}

export function buildCssFallbackBackground(
  colorVoid: string,
  colorGold: string,
  colorCyan: string,
  colorEmber: string,
): string {
  return [
    `radial-gradient(circle at 76% 24%, ${colorGold}22 0%, transparent 52%)`,
    `radial-gradient(circle at 18% 78%, ${colorCyan}1c 0%, transparent 50%)`,
    `radial-gradient(circle at 58% 88%, ${colorEmber}14 0%, transparent 44%)`,
    `linear-gradient(160deg, ${colorVoid} 0%, #090a0f 100%)`,
  ].join(", ");
}

export function HeroShaderCanvas({
  colorVoid = "#05030a",
  colorGold = "#d4af37",
  colorCyan = "#4de8e0",
  colorEmber = "#ff073a",
  intensity = 0.85,
  className = "",
  style,
}: HeroShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderMode, setRenderMode] = useState<"webgl" | "canvas2d" | "css">("css");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const clampedIntensity = Math.min(1, Math.max(0.15, intensity));
    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let prefersReduced =
      Boolean(mediaQuery?.matches) ||
      Boolean(typeof navigator !== "undefined" && navigator.webdriver);
    let inViewport = true;
    let isTabVisible = typeof document === "undefined" ? true : document.visibilityState !== "hidden";
    let contextLost = false;
    let rafId = 0;
    let running = false;
    let elapsedOffset = 0;
    let lastTick = 0;

    const pointer: [number, number] = [0.5, 0.5];
    const targetPointer: [number, number] = [0.5, 0.5];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let gl: WebGLRenderingContext | null = null;
    try {
      const attrs: WebGLContextAttributes = {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: true,
      };
      gl = (canvas.getContext("webgl", attrs) ||
        canvas.getContext("experimental-webgl", attrs)) as WebGLRenderingContext | null;
      if (gl && typeof gl.getParameter === "function") {
        const renderer = String(gl.getParameter(gl.RENDERER) ?? "");
        const debugExt =
          typeof gl.getExtension === "function"
            ? gl.getExtension("WEBGL_debug_renderer_info")
            : null;
        const unmasked =
          debugExt && typeof gl.getParameter === "function"
            ? String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) ?? "")
            : "";
        if (/swiftshader|llvmpipe|software|basic render/i.test(`${renderer} ${unmasked}`)) {
          gl = null;
        }
      }
    } catch {
      gl = null;
    }

    let glResources: {
      program: WebGLProgram;
      vs: WebGLShader;
      fs: WebGLShader;
      buffer: WebGLBuffer;
      uRes: WebGLUniformLocation | null;
      uTime: WebGLUniformLocation | null;
      uPointer: WebGLUniformLocation | null;
    } | null = null;

    const initWebGL = (ctx: WebGLRenderingContext): boolean => {
      const compile = (type: number, source: string): WebGLShader | null => {
        const shader = ctx.createShader(type);
        if (!shader) return null;
        ctx.shaderSource(shader, source);
        ctx.compileShader(shader);
        if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
          ctx.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compile(ctx.VERTEX_SHADER, VERTEX_SHADER);
      const fs = compile(ctx.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vs || !fs) {
        if (vs) ctx.deleteShader(vs);
        if (fs) ctx.deleteShader(fs);
        return false;
      }

      const program = ctx.createProgram();
      if (!program) {
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        return false;
      }

      ctx.attachShader(program, vs);
      ctx.attachShader(program, fs);
      ctx.linkProgram(program);
      if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        ctx.deleteProgram(program);
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        return false;
      }

      const buffer = ctx.createBuffer();
      if (!buffer) {
        ctx.deleteProgram(program);
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        return false;
      }

      ctx.useProgram(program);
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);

      const posLoc = ctx.getAttribLocation(program, "a_pos");
      ctx.enableVertexAttribArray(posLoc);
      ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0);

      ctx.uniform3fv(
        ctx.getUniformLocation(program, "u_void"),
        hexToNormalizedRgb(colorVoid, [0.02, 0.012, 0.04]),
      );
      ctx.uniform3fv(
        ctx.getUniformLocation(program, "u_gold"),
        hexToNormalizedRgb(colorGold, [0.831, 0.686, 0.216]),
      );
      ctx.uniform3fv(
        ctx.getUniformLocation(program, "u_cyan"),
        hexToNormalizedRgb(colorCyan, [0.302, 0.91, 0.878]),
      );
      ctx.uniform3fv(
        ctx.getUniformLocation(program, "u_ember"),
        hexToNormalizedRgb(colorEmber, [1.0, 0.027, 0.227]),
      );
      ctx.uniform1f(ctx.getUniformLocation(program, "u_intensity"), clampedIntensity);

      glResources = {
        program,
        vs,
        fs,
        buffer,
        uRes: ctx.getUniformLocation(program, "u_res"),
        uTime: ctx.getUniformLocation(program, "u_time"),
        uPointer: ctx.getUniformLocation(program, "u_pointer"),
      };
      return true;
    };

    let ctx2d: CanvasRenderingContext2D | null = null;
    let activeBackend: "webgl" | "canvas2d" | "css" = "css";

    if (gl && initWebGL(gl)) {
      activeBackend = "webgl";
    } else {
      gl = null;
      try {
        ctx2d = canvas.getContext("2d", { alpha: false });
      } catch {
        ctx2d = null;
      }
      activeBackend = ctx2d ? "canvas2d" : "css";
    }

    setRenderMode(activeBackend);
    if (activeBackend === "css") {
      return;
    }

    const syncDimensions = () => {
      const width = Math.max(1, Math.floor((canvas.clientWidth || 320) * dpr));
      const height = Math.max(1, Math.floor((canvas.clientHeight || 240) * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (activeBackend === "webgl" && gl && glResources && !contextLost) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(glResources.uRes, canvas.width, canvas.height);
      }
    };

    const drawCanvas2D = (seconds: number) => {
      if (!ctx2d) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.fillStyle = colorVoid;
      ctx2d.fillRect(0, 0, w, h);

      const ox = Math.sin(seconds * 0.25) * w * 0.06 + (pointer[0] - 0.5) * w * 0.08;
      const oy = Math.cos(seconds * 0.2) * h * 0.05 + (pointer[1] - 0.5) * h * 0.08;

      const gradGold = ctx2d.createRadialGradient(
        w * 0.74 + ox,
        h * 0.26 + oy,
        0,
        w * 0.74 + ox,
        h * 0.26 + oy,
        Math.max(w, h) * 0.55,
      );
      gradGold.addColorStop(0, `${colorGold}2b`);
      gradGold.addColorStop(1, "rgba(5, 3, 10, 0)");
      ctx2d.fillStyle = gradGold;
      ctx2d.fillRect(0, 0, w, h);

      const gradCyan = ctx2d.createRadialGradient(
        w * 0.22 - ox * 0.7,
        h * 0.76 - oy * 0.7,
        0,
        w * 0.22 - ox * 0.7,
        h * 0.76 - oy * 0.7,
        Math.max(w, h) * 0.5,
      );
      gradCyan.addColorStop(0, `${colorCyan}21`);
      gradCyan.addColorStop(1, "rgba(5, 3, 10, 0)");
      ctx2d.fillStyle = gradCyan;
      ctx2d.fillRect(0, 0, w, h);
    };

    const renderFrame = (now: number) => {
      if (lastTick > 0) {
        // Cap delta so resuming from a hidden tab never causes visual jumps
        const delta = Math.min(0.1, Math.max(0, (now - lastTick) / 1000));
        elapsedOffset += delta;
      }
      lastTick = now;

      pointer[0] += (targetPointer[0] - pointer[0]) * 0.06;
      pointer[1] += (targetPointer[1] - pointer[1]) * 0.06;

      const timeSeconds = prefersReduced ? 4.2 : elapsedOffset;

      if (activeBackend === "webgl" && gl && glResources && !contextLost) {
        gl.uniform1f(glResources.uTime, timeSeconds);
        gl.uniform2f(glResources.uPointer, pointer[0], pointer[1]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else if (activeBackend === "canvas2d") {
        drawCanvas2D(timeSeconds);
      }

      if (running) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const shouldAnimate = () => !prefersReduced && inViewport && isTabVisible && !contextLost;

    const updateRunState = () => {
      const nextRun = shouldAnimate();
      if (nextRun && !running) {
        running = true;
        lastTick = 0;
        rafId = window.requestAnimationFrame(renderFrame);
      } else if (!nextRun && running) {
        running = false;
        window.cancelAnimationFrame(rafId);
        lastTick = 0;
      }
    };

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState !== "hidden";
      updateRunState();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReduced = event.matches;
      updateRunState();
      if (prefersReduced) {
        lastTick = 0;
        renderFrame(0);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (prefersReduced) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      targetPointer[0] = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      targetPointer[1] = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      updateRunState();
    };

    const handleContextRestored = () => {
      if (gl && initWebGL(gl)) {
        contextLost = false;
        syncDimensions();
        renderFrame(0);
        updateRunState();
      }
    };

    syncDimensions();
    // Render one immediate deterministic frame, then schedule animation smoothly
    renderFrame(0);
    updateRunState();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncDimensions();
            if (!running) renderFrame(0);
          })
        : null;
    if (resizeObserver) resizeObserver.observe(canvas);
    else window.addEventListener("resize", syncDimensions, { passive: true });

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                inViewport = entry.isIntersecting;
              }
              updateRunState();
            },
            { threshold: 0.01 },
          )
        : null;
    if (intersectionObserver) intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    mediaQuery?.addEventListener?.("change", handleMotionChange);

    return () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncDimensions);
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      mediaQuery?.removeEventListener?.("change", handleMotionChange);

      if (gl && glResources) {
        gl.deleteBuffer(glResources.buffer);
        gl.deleteProgram(glResources.program);
        gl.deleteShader(glResources.vs);
        gl.deleteShader(glResources.fs);
      }
    };
  }, [colorVoid, colorGold, colorCyan, colorEmber, intensity]);

  const fallbackBackground = buildCssFallbackBackground(colorVoid, colorGold, colorCyan, colorEmber);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-render-mode={renderMode}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        background: fallbackBackground,
        ...style,
      }}
    />
  );
}

export default HeroShaderCanvas;
