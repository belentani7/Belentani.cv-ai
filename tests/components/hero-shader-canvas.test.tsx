/** @jest-environment jsdom */
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { HeroShaderCanvas, hexToNormalizedRgb } from "@/components/hero-shader-canvas";
import HeroShaderCompat from "@/components/HeroShader";

describe("HeroShaderCanvas & WebGL/Canvas2D/CSS fallback", () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  function mockMatchMedia(reducedMotion: boolean) {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  }

  it("hexToNormalizedRgb convierte colores hexadecimales CANON de 6 dígitos y aplica fallback seguro", () => {
    expect(hexToNormalizedRgb("#05030a", [0, 0, 0])).toEqual([5 / 255, 3 / 255, 10 / 255]);
    expect(hexToNormalizedRgb("#ffffff", [0, 0, 0])).toEqual([1, 1, 1]);
    expect(hexToNormalizedRgb("invalido", [0.02, 0.012, 0.04])).toEqual([0.02, 0.012, 0.04]);
  });

  it("degrada limpiamente a modo CSS estático cuando ni WebGL ni Canvas 2D están disponibles", () => {
    mockMatchMedia(false);
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);

    const { container } = render(<HeroShaderCanvas />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-render-mode")).toBe("css");
  });

  it("usa fallback Canvas 2D y respeta prefers-reduced-motion dibujando un único fotograma sin bucle RAF", () => {
    mockMatchMedia(true);
    const rafSpy = jest.spyOn(window, "requestAnimationFrame");
    const fakeGradient = { addColorStop: jest.fn() };
    const ctx2d = {
      fillStyle: "",
      fillRect: jest.fn(),
      createRadialGradient: jest.fn(() => fakeGradient),
    };

    HTMLCanvasElement.prototype.getContext = jest
      .fn()
      .mockImplementation((kind: string) => (kind === "2d" ? ctx2d : null));

    const { container } = render(<HeroShaderCanvas />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-render-mode")).toBe("canvas2d");
    expect(ctx2d.fillRect).toHaveBeenCalled();
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it("inicializa el pipeline GLSL WebGL, pausa al ocultar pestaña y libera GPU al desmontar", () => {
    mockMatchMedia(false);
    const deleteProgram = jest.fn();
    const deleteShader = jest.fn();
    const deleteBuffer = jest.fn();
    const drawArrays = jest.fn();

    const fakeGl = {
      VERTEX_SHADER: 0x8b31,
      FRAGMENT_SHADER: 0x8b30,
      COMPILE_STATUS: 0x8b81,
      LINK_STATUS: 0x8b82,
      ARRAY_BUFFER: 0x8892,
      STATIC_DRAW: 0x88e4,
      FLOAT: 0x1406,
      TRIANGLES: 0x0004,
      createShader: jest.fn(() => ({})),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn(() => true),
      getShaderInfoLog: jest.fn(() => ""),
      deleteShader,
      createProgram: jest.fn(() => ({})),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn(() => true),
      getProgramInfoLog: jest.fn(() => ""),
      deleteProgram,
      createBuffer: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      deleteBuffer,
      getAttribLocation: jest.fn(() => 0),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      getUniformLocation: jest.fn(() => ({})),
      useProgram: jest.fn(),
      viewport: jest.fn(),
      uniform2f: jest.fn(),
      uniform1f: jest.fn(),
      uniform3f: jest.fn(),
      uniform3fv: jest.fn(),
      drawArrays,
    };

    let rafCallback: FrameRequestCallback | null = null;
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 42;
    });
    const cancelSpy = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    HTMLCanvasElement.prototype.getContext = jest
      .fn()
      .mockImplementation((kind: string) => (kind === "webgl" ? fakeGl : null));

    const { container, unmount } = render(<HeroShaderCompat />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("data-render-mode")).toBe("webgl");

    if (rafCallback) {
      (rafCallback as FrameRequestCallback)(120);
    }
    expect(drawArrays).toHaveBeenCalledWith(fakeGl.TRIANGLES, 0, 3);

    // Simular pestaña oculta (Page Visibility API)
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(cancelSpy).toHaveBeenCalled();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });

    unmount();
    expect(deleteBuffer).toHaveBeenCalled();
    expect(deleteProgram).toHaveBeenCalled();
  });
});
