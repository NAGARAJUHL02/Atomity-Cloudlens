"use client";

/**
 * PixelSnow.tsx — Pixel-art snowflake background effect
 *
 * Renders a fixed canvas layer behind all content. Each "flake" is a
 * crisp square pixel that drifts downward with a gentle horizontal
 * sway. Colours are pulled from the project's accent palette so the
 * effect feels native to the CloudLens brand.
 *
 * Performance notes:
 *   • All drawing happens on a single <canvas> — no DOM nodes per flake.
 *   • requestAnimationFrame loop; paused when the tab is hidden.
 *   • Respects prefers-reduced-motion (canvas is hidden, loop skipped).
 *   • Canvas is resized with ResizeObserver to stay full-bleed.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────── */
interface Flake {
  x: number;
  y: number;
  size: number;       // px — always an integer (crisp pixel art)
  speed: number;      // px / frame (vertical fall)
  drift: number;      // amplitude of horizontal sine sway
  phase: number;      // sine phase offset (radians)
  opacity: number;
  color: string;      // rgba string from palette
  glowColor: string;  // lighter variant for shadow glow
}

/* ─── Palette matching design tokens ────────────────────────── */
const PALETTE: Array<{ color: string; glow: string }> = [
  { color: "rgba(52, 211, 153, 0.75)",  glow: "rgba(110, 231, 183, 0.5)" }, // --color-accent
  { color: "rgba(110, 231, 183, 0.55)", glow: "rgba(167, 243, 208, 0.4)" }, // --color-accent-bright
  { color: "rgba(42, 179, 131, 0.60)",  glow: "rgba(52, 211, 153, 0.35)"  }, // --color-accent-dim
  { color: "rgba(56, 189, 248, 0.35)",  glow: "rgba(125, 211, 252, 0.25)" }, // blue accent (memory)
  { color: "rgba(167, 139, 250, 0.25)", glow: "rgba(196, 181, 253, 0.2)"  }, // purple accent (other)
  { color: "rgba(232, 245, 240, 0.15)", glow: "rgba(232, 245, 240, 0.1)"  }, // near-white dust
];

const FLAKE_COUNT   = 140;   // total live flakes
const MIN_SIZE      = 1;     // px
const MAX_SIZE      = 4;     // px — keep it "pixel art" scale
const MIN_SPEED     = 0.25;
const MAX_SPEED     = 0.9;
const MIN_DRIFT_AMP = 0.3;
const MAX_DRIFT_AMP = 1.4;
const PHASE_SPEED   = 0.008; // radians per frame (sway frequency)

/* ─── Helpers ────────────────────────────────────────────────── */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function createFlake(canvasW: number, canvasH: number, fromTop = false): Flake {
  const { color, glow } = pick(PALETTE);
  const size = randInt(MIN_SIZE, MAX_SIZE);
  return {
    x: rand(0, canvasW),
    y: fromTop ? rand(-canvasH * 0.2, 0) : rand(0, canvasH),
    size,
    speed: rand(MIN_SPEED, MAX_SPEED) * (size * 0.35 + 0.65), // bigger = slightly faster
    drift: rand(MIN_DRIFT_AMP, MAX_DRIFT_AMP),
    phase: rand(0, Math.PI * 2),
    opacity: rand(0.4, 1),
    color,
    glowColor: glow,
  };
}

/* ─── Component ───────────────────────────────────────────────── */
export default function PixelSnow() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return; // honour accessibility preference

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── Size canvas to viewport ── */
    let W = 0;
    let H = 0;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    /* ── Initialise flakes spread across the full canvas ── */
    const flakes: Flake[] = Array.from({ length: FLAKE_COUNT }, () =>
      createFlake(W, H, false)
    );

    /* ── Animation loop ── */
    let raf: number;
    let frame = 0;

    const draw = () => {
      frame++;

      /* Clear with a very faint trail for a subtle motion-blur feel */
      ctx.clearRect(0, 0, W, H);

      for (const f of flakes) {
        /* Update position */
        f.phase += PHASE_SPEED;
        f.x += Math.sin(f.phase) * f.drift * 0.5;
        f.y += f.speed;

        /* Wrap: reset flake to top when it exits the bottom */
        if (f.y > H + f.size * 2) {
          Object.assign(f, createFlake(W, H, true));
        }
        /* Wrap horizontal */
        if (f.x < -f.size) f.x = W + f.size;
        if (f.x > W + f.size) f.x = -f.size;

        /* Draw glow (shadow) */
        ctx.save();
        ctx.shadowColor  = f.glowColor;
        ctx.shadowBlur   = f.size * 3;
        ctx.globalAlpha  = f.opacity;
        ctx.fillStyle    = f.color;

        /* Snap to integer coords for crisp pixel-art look */
        const px = Math.round(f.x);
        const py = Math.round(f.y);
        ctx.fillRect(px, py, f.size, f.size);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    /* Pause when tab is hidden to save CPU */
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [prefersReduced]);

  /* Hide the canvas entirely when user prefers reduced motion */
  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",   // never intercepts clicks
        zIndex: 0,               // sits behind everything
        display: "block",
      }}
    />
  );
}
