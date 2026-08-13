/**
 * AnimatedNumber.tsx — Counting animation for numeric totals
 *
 * WHY Framer Motion's useSpring + useTransform:
 * useSpring gives us a physics-based tween that feels natural
 * and doesn't overshoot awkwardly. useTransform lets us round
 * the animated value to 2 decimals on every frame without
 * causing re-renders — the motion value updates the DOM directly.
 *
 * WHY we check prefers-reduced-motion:
 * Animated numbers can be disorienting for some users. When
 * reduced motion is preferred we just show the final value
 * immediately.
 */

"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Prepended to the displayed number (e.g. "$") */
  prefix?: string;
  /** Appended to the displayed number */
  suffix?: string;
  /** Duration of the spring animation in seconds */
  duration?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className = "",
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const prevValue = useRef(0);

  /*
   * useSpring drives the animation from prevValue → value.
   * The stiffness/damping combo controls the "feel" of the
   * count-up — higher stiffness = faster, higher damping =
   * less oscillation.
   */
  const springValue = useSpring(prevValue.current, {
    stiffness: 100,
    damping: 30,
    duration: prefersReducedMotion ? 0 : duration,
  });

  /*
   * useTransform maps the raw spring number to a formatted
   * string with 2-decimal precision. This runs on every
   * animation frame but doesn't cause React re-renders
   * because it updates a MotionValue, not state.
   */
  const displayValue = useTransform(springValue, (latest) => {
    return `${prefix}${latest.toFixed(2)}${suffix}`;
  });

  useEffect(() => {
    prevValue.current = value;
    springValue.set(value);
  }, [value, springValue]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}
        {value.toFixed(2)}
        {suffix}
      </span>
    );
  }

  return <motion.span className={className}>{displayValue}</motion.span>;
}
