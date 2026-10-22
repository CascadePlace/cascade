import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

// ── DEBUG: rectangle-artifact isolation toggles ──────────────────
// Flip these one at a time to find which image causes the rectangle.
// Steps 1+2 ruled both sprites out — both back ON.
const SHOW_PLAYER_SPRITE = true;
const SHOW_HERO_FIGURE = true;
// ─────────────────────────────────────────────────────────────────

/**
 * Looping hero animation (14s, timings in globals.css):
 * - Player sprite enters from the right, stops right of center,
 *   turns around (horizontal flip), then walks back out to the right.
 *   Travel and flip are on separate elements so the transforms
 *   never fight each other.
 * - The figure (1.png) pops up from the bottom-left while the sprite
 *   is on screen, and drops back down as the sprite leaves.
 */
export default function HeroSprites() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {/* Moving player sprite — outer div travels, inner div flips */}
      {SHOW_PLAYER_SPRITE && (
      <div className="animate-hero-sprite absolute bottom-0 right-0 will-change-transform">
        <div
          className="animate-hero-sprite-flip"
          style={{ width: "clamp(56px, 7vw, 100px)" }}
        >
          <Image
            src={withBasePath("/player-sprite.png")}
            alt=""
            width={250}
            height={283}
            priority
            className="h-auto w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
      )}

      {/* Figure — slides up from the bottom-left */}
      {SHOW_HERO_FIGURE && (
      <div
        className="animate-hero-figure absolute bottom-0 left-[4%] will-change-transform"
        style={{ width: "clamp(48px, 6vw, 90px)" }}
      >
        <Image
          src={withBasePath("/hero-figure-1.png")}
          alt=""
          width={225}
          height={452}
          priority
          className="h-auto w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
        />
      </div>
      )}
    </div>
  );
}
