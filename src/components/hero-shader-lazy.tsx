"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { HeroShaderProps } from "./hero-shader-canvas";

const DeferredHeroShaderCanvas = dynamic(
  () => import("./hero-shader-canvas").then((m) => m.HeroShaderCanvas),
  { ssr: false },
);

function createStaticAtmosphere(
  colorVoid = "#05030a",
  colorGold = "#d4af37",
  colorCyan = "#4de8e0",
  colorEmber = "#ff073a",
): string {
  return [
    `radial-gradient(circle at 76% 24%, ${colorGold}22 0%, transparent 52%)`,
    `radial-gradient(circle at 18% 78%, ${colorCyan}1c 0%, transparent 50%)`,
    `radial-gradient(circle at 58% 88%, ${colorEmber}14 0%, transparent 44%)`,
    `linear-gradient(160deg, ${colorVoid} 0%, #090a0f 100%)`,
  ].join(", ");
}

/**
 * Pinta instantáneamente la atmósfera CSS estática en el primer fotograma (0 ms de bloqueo en LCP/TBT)
 * y difiere la inicialización del lienzo GPU al periodo de inactividad posterior a la carga.
 */
export function HeroShaderLazy(props: HeroShaderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const scheduleIdle = () => {
      const win = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof win.requestIdleCallback === "function") {
        idleId = win.requestIdleCallback(activate, { timeout: 2000 });
      } else {
        timerId = setTimeout(activate, 900);
      }
    };

    if (document.readyState === "complete") {
      timerId = setTimeout(scheduleIdle, 400);
    } else {
      window.addEventListener("load", scheduleIdle, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", scheduleIdle);
      if (timerId !== null) clearTimeout(timerId);
      const win = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }
    };
  }, []);

  const background = createStaticAtmosphere(
    props.colorVoid,
    props.colorGold,
    props.colorCyan,
    props.colorEmber,
  );

  if (!ready) {
    return (
      <div
        aria-hidden="true"
        data-render-mode="css-idle"
        className={props.className}
        style={{
          width: "100%",
          height: "100%",
          background,
          ...props.style,
        }}
      />
    );
  }

  return <DeferredHeroShaderCanvas {...props} />;
}
