"use client";

import { useEffect, useState } from "react";

type Star = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

type Cloud = {
  top: number;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
  flip: boolean;
};

type Bolt = {
  left: number;
  flipped: boolean;
  key: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Seeded PRNG (mulberry32) so the starfield is identical on server and
// client — deterministic output avoids any SSR hydration mismatch without
// needing to generate it in an effect.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seededRand = mulberry32(1337);
const srand = (min: number, max: number) => min + seededRand() * (max - min);

const STARS: Star[] = Array.from({ length: 140 }, () => ({
  left: srand(0, 100),
  top: srand(0, 70),
  size: srand(1, 2.6),
  delay: srand(0, 6),
  duration: srand(2, 6),
  opacity: srand(0.4, 1),
}));

// Keep clouds high in the sky (top ≤ 20%) so they never drift behind the
// hero heading/CTA, and keep them small + faint so they read as clouds
// rather than a solid gray slab over the dark backdrop.
const CLOUDS: Cloud[] = Array.from({ length: 7 }, (_, i) => ({
  top: srand(2, 20),
  scale: srand(0.6, 1.15),
  duration: srand(60, 120),
  delay: -srand(0, 120), // negative delay: clouds start mid-drift
  opacity: srand(0.08, 0.16),
  flip: i % 2 === 0,
}));

export default function HeroEffects() {
  const [bolt, setBolt] = useState<Bolt | null>(null);

  // Occasional lightning strikes
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const strike = () => {
      if (cancelled) return;
      setBolt({
        left: rand(8, 92),
        flipped: Math.random() > 0.5,
        key: Date.now(),
      });
      // Bolt + flash visible ~600ms, then clear
      timeout = setTimeout(() => {
        setBolt(null);
        // Next strike in 4–11s
        timeout = setTimeout(strike, rand(4000, 11000));
      }, 600);
    };

    timeout = setTimeout(strike, rand(2000, 5000));
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: "0 0 4px rgba(255,255,255,0.6)",
          }}
        />
      ))}

      {/* Clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute animate-cloud-drift"
          style={{
            top: `${c.top}%`,
            opacity: c.opacity,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <svg
            width={280 * c.scale}
            height={90 * c.scale}
            viewBox="0 0 280 90"
            fill="none"
            style={{
              filter: "blur(10px)",
              transform: c.flip ? "scaleX(-1)" : undefined,
            }}
          >
            <ellipse cx="70" cy="60" rx="70" ry="26" fill="white" />
            <ellipse cx="140" cy="45" rx="60" ry="30" fill="white" />
            <ellipse cx="210" cy="62" rx="68" ry="24" fill="white" />
          </svg>
        </div>
      ))}

      {/* Lightning */}
      {bolt && (
        <>
          {/* Sky flash — localized radial glow around the bolt instead of a
              full-screen solid white layer. A viewport-sized solid div
              animating opacity gets composited as its own giant layer, which
              can tear into visible gray tiles mid-animation (the "rectangle"
              artifact) and washes the whole hero gray. */}
          <div
            key={`flash-${bolt.key}`}
            className="absolute inset-0 animate-lightning-flash"
            style={{
              willChange: "opacity",
              transform: "translateZ(0)",
              background: `radial-gradient(ellipse 55% 60% at ${bolt.left}% 25%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 50%, transparent 78%)`,
            }}
          />
          {/* Bolt */}
          <svg
            key={`bolt-${bolt.key}`}
            className="absolute top-0 animate-lightning-bolt"
            style={{
              left: `${bolt.left}%`,
              height: "72%",
              transform: bolt.flipped ? "scaleX(-1)" : undefined,
              filter:
                "drop-shadow(0 0 6px rgba(180,210,255,0.95)) drop-shadow(0 0 18px rgba(140,180,255,0.6))",
            }}
            viewBox="0 0 100 400"
            preserveAspectRatio="none"
            width="60"
          >
            <path
              d="M52 0 L44 78 L60 84 L38 170 L56 176 L30 268 L48 272 L22 400"
              stroke="#eaf2ff"
              strokeWidth="4"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M60 84 L82 130 L70 132 L88 176"
              stroke="#dbe9ff"
              strokeWidth="2.5"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M56 176 L40 224 L52 226 L34 268"
              stroke="#dbe9ff"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </>
      )}
    </div>
  );
}
