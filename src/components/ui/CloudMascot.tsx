"use client";

/**
 * CloudMascot.tsx — Interactive CloudLens mascot
 *
 * A small, friendly face that lives near the CloudLens heading.
 * • Pupils track the user's mouse cursor with spring easing
 * • Idle animations: blinking, subtle breathing/floating, occasional eye drift
 * • Respects prefers-reduced-motion
 * • Responsive: full tracking on desktop, reduced on tablet, centered on mobile
 * • Built entirely with SVG + Framer Motion — no external assets
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  animate,
} from "framer-motion";

/* ─── Constants ─── */
const MASCOT_SIZE = 64; // px — overall SVG viewBox logical size
const EYE_RADIUS = 10;
const PUPIL_RADIUS = 4;
const MAX_PUPIL_OFFSET = 4.5; // how far a pupil can move from center
const SPRING_CONFIG = { stiffness: 150, damping: 20, mass: 0.4 };

/* Breakpoints matching the project's fluid scale */
const TABLET_MAX = 1024;
const MOBILE_MAX = 640;

export default function CloudMascot() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Pupil motion values (shared for both eyes, offset later) ── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pupilX = useSpring(rawX, SPRING_CONFIG);
  const pupilY = useSpring(rawY, SPRING_CONFIG);

  /* ── Idle drift motion values ── */
  const idleDriftX = useMotionValue(0);
  const idleDriftY = useMotionValue(0);
  const smoothDriftX = useSpring(idleDriftX, { stiffness: 40, damping: 15, mass: 1 });
  const smoothDriftY = useSpring(idleDriftY, { stiffness: 40, damping: 15, mass: 1 });

  /* ── Blink state ── */
  const [blinkPhase, setBlinkPhase] = useState(false);

  /* ── Viewport tier ── */
  const [tier, setTier] = useState<"desktop" | "tablet" | "mobile">("desktop");

  /* Determine viewport tier */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= MOBILE_MAX) setTier("mobile");
      else if (w <= TABLET_MAX) setTier("tablet");
      else setTier("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── Mouse tracking ── */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReduced || tier === "mobile") return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist === 0) {
        rawX.set(0);
        rawY.set(0);
        return;
      }

      /* Normalise direction, scale by clamped range */
      const maxRange = tier === "tablet" ? MAX_PUPIL_OFFSET * 0.5 : MAX_PUPIL_OFFSET;
      const scale = Math.min(dist / 300, 1); // ramp up over 300px
      rawX.set((dx / dist) * maxRange * scale);
      rawY.set((dy / dist) * maxRange * scale);
    },
    [prefersReduced, tier, rawX, rawY],
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  /* ── Blinking ── */
  useEffect(() => {
    if (prefersReduced) return;

    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 4000; // 2.5–6.5 s
      return setTimeout(() => {
        setBlinkPhase(true);
        setTimeout(() => setBlinkPhase(false), 150);
        timerRef.current = scheduleBlink();
      }, delay);
    };

    const timerRef = { current: scheduleBlink() };
    return () => clearTimeout(timerRef.current);
  }, [prefersReduced]);

  /* ── Idle drift (occasional small eye movement) ── */
  useEffect(() => {
    if (prefersReduced) return;

    const drift = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        const ax = (Math.random() - 0.5) * 2;
        const ay = (Math.random() - 0.5) * 1.5;
        idleDriftX.set(ax);
        idleDriftY.set(ay);
        // Return to zero after a beat
        setTimeout(() => {
          idleDriftX.set(0);
          idleDriftY.set(0);
        }, 800 + Math.random() * 600);
        driftTimer.current = drift();
      }, delay);
    };

    const driftTimer = { current: drift() };
    return () => clearTimeout(driftTimer.current);
  }, [prefersReduced, idleDriftX, idleDriftY]);

  /* ── Breathing / floating ── */
  const breathY = useMotionValue(0);
  useEffect(() => {
    if (prefersReduced) return;
    const controls = animate(breathY, [0, -1.5, 0], {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [prefersReduced, breathY]);

  /* ── Eye scaleY for blink ── */
  const eyeScaleY = blinkPhase ? 0.08 : 1;

  /* ── Render helpers ── */
  const renderEye = (eyeCx: number, eyeCy: number, key: string) => (
    <g key={key}>
      {/* Emerald accent ring */}
      <circle
        cx={eyeCx}
        cy={eyeCy}
        r={EYE_RADIUS + 1.5}
        fill="none"
        stroke="rgba(52,211,153,0.25)"
        strokeWidth={1.2}
      />
      {/* Eye white — scales on Y to simulate blink */}
      <motion.ellipse
        cx={eyeCx}
        cy={eyeCy}
        rx={EYE_RADIUS}
        ry={EYE_RADIUS}
        fill="rgba(232,245,240,0.92)"
        style={{
          scaleY: eyeScaleY,
          transformOrigin: `${eyeCx}px ${eyeCy}px`,
        }}
      />
      {/*
       * Pupil group — two nested motion.g layers:
       *   outer: cursor-tracking translation (pupilX/Y)
       *   inner: idle drift translation (smoothDriftX/Y)
       */}
      <motion.g style={{ x: pupilX, y: pupilY }}>
        <motion.g
          style={{
            x: smoothDriftX,
            y: smoothDriftY,
            scaleY: eyeScaleY,
            transformOrigin: `${eyeCx}px ${eyeCy}px`,
          }}
        >
          {/* Dark pupil */}
          <circle cx={eyeCx} cy={eyeCy} r={PUPIL_RADIUS} fill="#0a0f0d" />
          {/* Specular highlight */}
          <circle
            cx={eyeCx - 1.5}
            cy={eyeCy - 1.5}
            r={1.3}
            fill="rgba(255,255,255,0.7)"
          />
        </motion.g>
      </motion.g>
    </g>
  );

  /* ── Eye positions ── */
  const leftEyeX = 22;
  const rightEyeX = 42;
  const eyeY = 26;

  return (
    <div
      ref={containerRef}
      aria-label="CloudLens interactive mascot"
      role="img"
      style={{
        width: MASCOT_SIZE,
        height: MASCOT_SIZE,
        flexShrink: 0,
        position: "relative",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* Subtle glow behind the mascot */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.svg
        viewBox={`0 0 ${MASCOT_SIZE} ${MASCOT_SIZE}`}
        width={MASCOT_SIZE}
        height={MASCOT_SIZE}
        style={{
          display: "block",
          translateY: breathY,
          overflow: "visible",
        }}
      >
        {/* Eyebrows */}
        <motion.path
          d={`M ${leftEyeX - 6} ${eyeY - 13} Q ${leftEyeX} ${eyeY - 17}, ${leftEyeX + 6} ${eyeY - 13}`}
          fill="none"
          stroke="rgba(232,245,240,0.5)"
          strokeWidth={1.4}
          strokeLinecap="round"
          style={{ scaleY: blinkPhase ? 0.3 : 1, transformOrigin: `${leftEyeX}px ${eyeY - 13}px` }}
        />
        <motion.path
          d={`M ${rightEyeX - 6} ${eyeY - 13} Q ${rightEyeX} ${eyeY - 17}, ${rightEyeX + 6} ${eyeY - 13}`}
          fill="none"
          stroke="rgba(232,245,240,0.5)"
          strokeWidth={1.4}
          strokeLinecap="round"
          style={{ scaleY: blinkPhase ? 0.3 : 1, transformOrigin: `${rightEyeX}px ${eyeY - 13}px` }}
        />

        {/* Eyes */}
        {renderEye(leftEyeX, eyeY, "left-eye")}
        {renderEye(rightEyeX, eyeY, "right-eye")}

        {/* Smile */}
        <path
          d={`M 25 ${eyeY + 14} Q 32 ${eyeY + 20}, 39 ${eyeY + 14}`}
          fill="none"
          stroke="rgba(52,211,153,0.5)"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}
