"use client";

/**
 * ShapeGrid.tsx — Animated line-grid background with glowing intersection dots
 *
 * Faithfully replicates the React Bits "Shape Grid" background as seen in
 * the reference image:
 *   • Full-viewport dark grid of thin horizontal + vertical lines
 *   • Small "+" cross markers drawn at every grid intersection
 *   • Intersection dots randomly illuminate (fade-in → linger → fade-out)
 *     with the CloudLens emerald / ice-blue accent palette
 *
 * Performance:
 *   • Single <canvas>, RAF loop, paused on hidden tab
 *   • ResizeObserver for full-bleed at any viewport
 *   • prefers-reduced-motion → static grid only, no animation
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* ─── Config ──────────────────────────────────────────────────── */
const CELL          = 44;      // px — grid pitch (line spacing)
const LINE_COLOR    = "rgba(52, 211, 153, 0.07)";   // very dim emerald lines
const CROSS_COLOR   = "rgba(52, 211, 153, 0.18)";   // slightly brighter cross ticks
const CROSS_ARM     = 4;       // px — half-length of each cross arm

/* Glow dot accent colours */
const DOT_COLORS = [
  { fill: "rgba(52,  211, 153, 1)", glow: "rgba(52,  211, 153, 0.55)" }, // emerald
  { fill: "rgba(56,  189, 248, 1)", glow: "rgba(56,  189, 248, 0.45)" }, // ice-blue
  { fill: "rgba(110, 231, 183, 1)", glow: "rgba(110, 231, 183, 0.45)" }, // mint
  { fill: "rgba(167, 139, 250, 1)", glow: "rgba(167, 139, 250, 0.35)" }, // lavender
];

const DOT_RADIUS        = 2.5;
const FADE_IN_SPEED     = 0.022;
const FADE_OUT_SPEED    = 0.014;
const LINGER_FRAMES     = 90;   // frames to stay fully lit before fading
const ACTIVATION_PROB   = 0.0008; // chance per frame a dim intersection activates
const MAX_ACTIVE        = 30;   // max simultaneous glowing intersections

/* ─── Intersection state ──────────────────────────────────────── */
type Phase = "idle" | "in" | "hold" | "out";
interface Dot {
  x: number;
  y: number;
  alpha: number;
  phase: Phase;
  holdFrames: number;
  color: (typeof DOT_COLORS)[number];
}

/* ─── Component ───────────────────────────────────────────────── */
export default function ShapeGrid() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── Sizing ── */
    let W = 0, H = 0;
    /* All intersection x,y coords */
    let intersections: { x: number; y: number }[] = [];
    let dots: Dot[] = [];

    const buildGrid = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;

      intersections = [];
      for (let x = 0; x <= W + CELL; x += CELL) {
        for (let y = 0; y <= H + CELL; y += CELL) {
          intersections.push({ x, y });
        }
      }
      /* Preserve active dots that are still on-screen */
      dots = dots.filter((d) => d.x <= W + CELL && d.y <= H + CELL);
    };
    buildGrid();

    const ro = new ResizeObserver(buildGrid);
    ro.observe(document.documentElement);

    /* ── Draw ── */
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* ── Grid lines ── */
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth   = 1;
      ctx.beginPath();

      /* Vertical lines */
      for (let x = 0; x <= W + CELL; x += CELL) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, H);
      }
      /* Horizontal lines */
      for (let y = 0; y <= H + CELL; y += CELL) {
        ctx.moveTo(0,  y + 0.5);
        ctx.lineTo(W,  y + 0.5);
      }
      ctx.stroke();

      /* ── Cross markers at every intersection ── */
      ctx.strokeStyle = CROSS_COLOR;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      for (const pt of intersections) {
        /* horizontal arm */
        ctx.moveTo(pt.x - CROSS_ARM, pt.y);
        ctx.lineTo(pt.x + CROSS_ARM, pt.y);
        /* vertical arm */
        ctx.moveTo(pt.x, pt.y - CROSS_ARM);
        ctx.lineTo(pt.x, pt.y + CROSS_ARM);
      }
      ctx.stroke();

      /* ── Activation (skip in reduced-motion mode) ── */
      if (!prefersReduced) {
        const idleIntersections = intersections.filter(
          (pt) => !dots.find((d) => d.x === pt.x && d.y === pt.y)
        );

        for (const pt of idleIntersections) {
          if (dots.length < MAX_ACTIVE && Math.random() < ACTIVATION_PROB) {
            dots.push({
              x: pt.x,
              y: pt.y,
              alpha: 0,
              phase: "in",
              holdFrames: 0,
              color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
            });
          }
        }

        /* Update + draw each active dot */
        dots = dots.filter((d) => {
          /* State machine */
          if (d.phase === "in") {
            d.alpha += FADE_IN_SPEED;
            if (d.alpha >= 1) { d.alpha = 1; d.phase = "hold"; }
          } else if (d.phase === "hold") {
            d.holdFrames++;
            if (d.holdFrames >= LINGER_FRAMES) d.phase = "out";
          } else if (d.phase === "out") {
            d.alpha -= FADE_OUT_SPEED;
            if (d.alpha <= 0) return false; // remove
          }

          /* Draw glow halo */
          ctx.save();
          ctx.globalAlpha  = d.alpha * 0.6;
          ctx.shadowColor  = d.color.glow;
          ctx.shadowBlur   = 10;
          ctx.fillStyle    = d.color.glow;
          ctx.beginPath();
          ctx.arc(d.x, d.y, DOT_RADIUS * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          /* Draw crisp dot */
          ctx.save();
          ctx.globalAlpha = d.alpha;
          ctx.fillStyle   = d.color.fill;
          ctx.beginPath();
          ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          return true;
        });
      }
    };

    /* ── RAF loop ── */
    let raf: number;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        display: "block",
      }}
    />
  );
}
