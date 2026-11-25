"use client";

import { HeroShaderCanvas } from "./hero-shader-canvas";

/**
 * Wrapper compatible con importaciones heredadas `<HeroShader colorA="..." colorB="..." />`.
 * Delega en `HeroShaderCanvas` (WebGL GLSL propio -> Canvas 2D -> CSS puro,
 * respetando prefers-reduced-motion y document.visibilityState).
 */
export default function HeroShader({
  colorA = "#05030a",
  colorB = "#d4af37",
  className = "",
  style = undefined,
}) {
  return (
    <HeroShaderCanvas
      colorVoid={colorA}
      colorGold={colorB}
      className={className}
      style={style}
    />
  );
}
