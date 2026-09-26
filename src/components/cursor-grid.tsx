"use client";

import { useEffect, useRef } from "react";

const CELL_SIZE = 44;
const RADIUS = 110;
const BASE_ALPHA = 0.2;
const HOVER_ALPHA = 0.75;
const DOT = 3;

/**
 * The accent lattice that sits behind the whole page.
 *
 * Two details are load-bearing rather than cosmetic:
 *
 * - The pointer listener is bound to `window`, not to the canvas. The layer is
 *   `position: fixed` over the entire viewport, so a listener on the element
 *   would never fire for most of the page and, without `pointer-events: none`
 *   in CSS, would swallow every click.
 * - Under `prefers-reduced-motion` the pointer is ignored entirely and a single
 *   frame is drawn per resize. A lattice that brightens around a cursor is
 *   motion even though nothing is animating on a timeline.
 *
 * Redraws are on demand — pointer move and resize — rather than on a
 * `requestAnimationFrame` loop. The lattice is otherwise static, so a
 * continuous loop would burn battery to repaint identical pixels.
 */
export function CursorGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pointer = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };

    let width = 0;
    let height = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / CELL_SIZE) + 1;
      const rows = Math.ceil(height / CELL_SIZE) + 1;

      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          const x = cx * CELL_SIZE;
          const y = cy * CELL_SIZE;

          let alpha = BASE_ALPHA;
          if (!reducedMotion) {
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            const falloff = Math.max(0, 1 - distance / RADIUS);
            alpha += (HOVER_ALPHA - BASE_ALPHA) * falloff;
          }

          ctx.fillStyle = `rgba(157, 180, 227, ${alpha})`;
          ctx.fillRect(x, y, DOT, DOT);
        }
      }
    };

    const resize = () => {
      // Capped at 2: the lattice is 3px dots, so a 3x device ratio would triple
      // the fill cost for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      draw();
    };

    resize();

    window.addEventListener("resize", resize);
    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className="cursor-grid" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
