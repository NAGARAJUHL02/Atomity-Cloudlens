/**
 * GradientWave.tsx — Decorative animated SVG wave behind the heading
 *
 * WHY CSS keyframes instead of Framer Motion:
 * This is a continuous, looping ambient animation — not a one-shot
 * entrance. CSS keyframes are more efficient for infinite loops
 * because they run on the compositor thread and don't cause JS
 * re-renders on every frame.
 *
 * WHY prefers-reduced-motion freezes instead of removing:
 * Users who prefer reduced motion still see the wave as a static
 * decorative element — it just doesn't drift. This preserves the
 * visual design while respecting accessibility preferences. The
 * freeze is handled in globals.css via the blanket reduced-motion
 * rule, but we also add animation-play-state: paused as a safeguard.
 */

"use client";

export default function GradientWave() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        insetInline: 0,
        /*
         * Position the wave vertically centered behind the heading.
         * The heading is roughly 2rem tall, so we offset to align.
         */
        top: "50%",
        transform: "translateY(-50%)",
        height: "3px",
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0.6,
      }}
    >
      <svg
        className="gradient-wave-svg"
        viewBox="0 0 1200 6"
        preserveAspectRatio="none"
        style={{
          width: "200%", // Double width so the animation can shift half
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="var(--color-accent-dim)" stopOpacity="0.4" />
            <stop offset="40%" stopColor="var(--color-accent)" stopOpacity="0.8" />
            <stop offset="60%" stopColor="var(--color-accent-bright)" stopOpacity="0.6" />
            <stop offset="80%" stopColor="var(--color-accent-dim)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/*
          * A gentle sine-wave path. The wave has a very low amplitude
          * (±1.5px) so it reads as a softly undulating line, not a
          * dramatic wave.
          */}
        <path
          d="M0 3 Q50 0.5 100 3 T200 3 T300 3 T400 3 T500 3 T600 3 T700 3 T800 3 T900 3 T1000 3 T1100 3 T1200 3"
          fill="none"
          stroke="url(#wave-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Scoped styles for the wave animation */}
      <style>{`
        .gradient-wave-svg {
          animation: wave-drift 8s ease-in-out infinite alternate;
        }

        @keyframes wave-drift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }

        /*
         * Freeze animation for reduced-motion users.
         * The blanket rule in globals.css also catches this,
         * but we double up for safety.
         */
        @media (prefers-reduced-motion: reduce) {
          .gradient-wave-svg {
            animation-play-state: paused;
          }
        }
      `}</style>
    </div>
  );
}
