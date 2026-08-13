"use client";

/**
 * CloudWave.tsx — Futuristic 3D wave animation with parallax & 3D bars
 *
 * Full-width top-surface visual:
 * • Multi-layered luminous wave lines (cyan→purple→emerald)
 * • Mouse-following parallax on wave layers via motion.g for 3D depth
 * • Scattered ambient particles
 * • Decorative 3D bars with hover raise/glow/shadow effects
 * • Single SVG — all layers share defs, no id conflicts
 * • Pure CSS keyframes + Framer Motion springs — 60 FPS
 * • Respects prefers-reduced-motion
 */

import { useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/* ── Particles ── */
const PT = [
  { x: 60, y: 100, r: 1.1, o: 0.35, d: 0 },
  { x: 140, y: 65, r: 0.7, o: 0.2, d: 3.2 },
  { x: 210, y: 155, r: 1.3, o: 0.4, d: 1.1 },
  { x: 290, y: 90, r: 0.6, o: 0.18, d: 7.5 },
  { x: 370, y: 130, r: 1.0, o: 0.3, d: 4.8 },
  { x: 430, y: 60, r: 0.9, o: 0.25, d: 2.0 },
  { x: 510, y: 115, r: 1.4, o: 0.45, d: 6.3 },
  { x: 580, y: 165, r: 0.8, o: 0.22, d: 9.1 },
  { x: 650, y: 80, r: 1.2, o: 0.38, d: 0.5 },
  { x: 730, y: 140, r: 0.7, o: 0.2, d: 5.5 },
  { x: 810, y: 70, r: 1.0, o: 0.32, d: 3.8 },
  { x: 880, y: 125, r: 1.3, o: 0.42, d: 8.0 },
  { x: 950, y: 95, r: 0.6, o: 0.18, d: 1.7 },
  { x: 1030, y: 150, r: 0.9, o: 0.28, d: 6.9 },
  { x: 1100, y: 60, r: 1.1, o: 0.35, d: 4.2 },
  { x: 1170, y: 118, r: 0.8, o: 0.24, d: 10.0 },
  { x: 1250, y: 85, r: 1.4, o: 0.4, d: 2.6 },
  { x: 1320, y: 145, r: 0.7, o: 0.2, d: 7.3 },
  { x: 1390, y: 105, r: 1.0, o: 0.3, d: 5.0 },
  { x: 100, y: 175, r: 0.5, o: 0.15, d: 8.5 },
  { x: 330, y: 120, r: 1.5, o: 0.5, d: 3.0 },
  { x: 610, y: 100, r: 1.3, o: 0.45, d: 7.0 },
  { x: 980, y: 110, r: 1.4, o: 0.48, d: 1.5 },
  { x: 1200, y: 75, r: 1.2, o: 0.4, d: 5.2 },
  { x: 450, y: 180, r: 0.6, o: 0.12, d: 6.0 },
  { x: 760, y: 190, r: 0.5, o: 0.1, d: 1.3 },
  { x: 1100, y: 185, r: 0.7, o: 0.15, d: 9.5 },
];

/* ── Wave paths ── */
const W1 = "M-50 140 C150 140, 300 65, 500 110 C700 155, 850 80, 1050 100 C1250 120, 1370 60, 1490 85";
const W2 = "M-50 165 C180 110, 380 155, 580 80 C780 5, 980 130, 1150 95 C1320 60, 1410 120, 1490 110";
const W3 = "M-50 115 C220 175, 440 85, 650 145 C860 205, 1060 110, 1250 155 C1380 180, 1440 135, 1490 155";

/* ── Single wave layer: glow halo + soft edge + crisp line ── */
function WaveLayer({ d, grad, sw, op, cls }: { d: string; grad: string; sw: number; op: number; cls: string }) {
  return (
    <g className={cls}>
      <path d={d} fill="none" stroke={grad} strokeWidth={sw * 8} strokeLinecap="round" opacity={op * 0.25} filter="url(#cw-bh)" />
      <path d={d} fill="none" stroke={grad} strokeWidth={sw * 3} strokeLinecap="round" opacity={op * 0.5} filter="url(#cw-bs)" />
      <path d={d} fill="none" stroke={grad} strokeWidth={sw} strokeLinecap="round" opacity={op} />
    </g>
  );
}

export default function CloudWave() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const sx = useSpring(rawX, { stiffness: 35, damping: 20, mass: 0.8 });
  const sy = useSpring(rawY, { stiffness: 35, damping: 20, mass: 0.8 });

  const p1x = useTransform(sx, [-1, 1], [-18, 18]);
  const p1y = useTransform(sy, [-1, 1], [-10, 10]);
  const p2x = useTransform(sx, [-1, 1], [12, -12]);
  const p2y = useTransform(sy, [-1, 1], [6, -6]);
  const p3x = useTransform(sx, [-1, 1], [-6, 6]);
  const p3y = useTransform(sy, [-1, 1], [-4, 4]);
  const ppx = useTransform(sx, [-1, 1], [8, -8]);
  const ppy = useTransform(sy, [-1, 1], [5, -5]);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReduced) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    },
    [prefersReduced, rawX, rawY],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="cw-root"
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 340,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* ── Single SVG — all layers share one set of defs ── */}
      <motion.svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "70%", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="cw-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="cw-g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2ab383" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="cw-g3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="cw-pg">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
          <filter id="cw-bh"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="cw-bs"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="cw-ba"><feGaussianBlur stdDeviation="22" /></filter>
        </defs>

        {/* Atmospheric glow */}
        <ellipse cx="300" cy="110" rx="280" ry="70" fill="rgba(34,211,238,0.04)" filter="url(#cw-ba)" className="cw-glow" />
        <ellipse cx="720" cy="95" rx="220" ry="60" fill="rgba(167,139,250,0.03)" filter="url(#cw-ba)" className="cw-glow-alt" />
        <ellipse cx="1150" cy="110" rx="260" ry="70" fill="rgba(52,211,153,0.04)" filter="url(#cw-ba)" className="cw-glow" />

        {/* Wave layer 3 (back) with parallax */}
        <motion.g style={{ x: p3x, y: p3y }}>
          <WaveLayer d={W3} grad="url(#cw-g3)" sw={1} op={0.3} cls="cw-w3" />
        </motion.g>

        {/* Wave layer 2 (mid) with parallax */}
        <motion.g style={{ x: p2x, y: p2y }}>
          <WaveLayer d={W2} grad="url(#cw-g2)" sw={1.3} op={0.5} cls="cw-w2" />
        </motion.g>

        {/* Wave layer 1 (front) with parallax */}
        <motion.g style={{ x: p1x, y: p1y }}>
          <WaveLayer d={W1} grad="url(#cw-g1)" sw={1.6} op={0.7} cls="cw-w1" />
        </motion.g>

        {/* Particles with parallax */}
        <motion.g style={{ x: ppx, y: ppy }}>
          {PT.map((p, i) => (
            <circle key={i} className="cw-p" cx={p.x} cy={p.y} r={p.r} fill="url(#cw-pg)" opacity={p.o} style={{ animationDelay: `${p.d}s` }} />
          ))}
        </motion.g>
      </motion.svg>



      {/* Fades */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom, transparent, #0a0f0d)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "12%", background: "linear-gradient(to top, transparent, rgba(10,15,13,0.4))", pointerEvents: "none" }} />

      <style>{`
        .cw-w1{animation:cw-d1 10s ease-in-out infinite alternate}
        .cw-w2{animation:cw-d2 12s ease-in-out infinite alternate}
        .cw-w3{animation:cw-d3 14s ease-in-out infinite alternate}
        @keyframes cw-d1{0%{transform:translate(0,0)}50%{transform:translate(-12px,-3px)}100%{transform:translate(-20px,2px)}}
        @keyframes cw-d2{0%{transform:translate(0,0)}50%{transform:translate(10px,3px)}100%{transform:translate(16px,-2px)}}
        @keyframes cw-d3{0%{transform:translate(0,0)}50%{transform:translate(-8px,2px)}100%{transform:translate(-14px,-3px)}}
        .cw-p{animation:cw-pf 10s ease-in-out infinite}
        @keyframes cw-pf{0%,100%{transform:translate(0,0)}25%{transform:translate(3px,-2.5px);opacity:.55}50%{transform:translate(-2px,2px);opacity:.1}75%{transform:translate(2px,-1px);opacity:.45}}
        .cw-glow{animation:cw-gp 8s ease-in-out infinite alternate}
        .cw-glow-alt{animation:cw-gp 10s ease-in-out infinite alternate-reverse}
        @keyframes cw-gp{0%{opacity:.5}100%{opacity:1}}
        @media(max-width:1024px){.cw-root{height:260px!important}}
        @media(max-width:640px){.cw-root{height:180px!important}}
        @media(prefers-reduced-motion:reduce){.cw-w1,.cw-w2,.cw-w3,.cw-p,.cw-glow,.cw-glow-alt{animation-play-state:paused!important}}
      `}</style>
    </div>
  );
}
