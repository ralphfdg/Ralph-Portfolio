import type { CSSProperties } from "react";

type GradualBlurProps = {
  /** Stacked `backdrop-filter` layers. Each one costs real compositing work. */
  divCount?: number;
  /** Blur radius in px for the strongest (edge) layer. */
  strength?: number;
  /** Overlay thickness. */
  height?: string;
  /** Which edge of the viewport the blur is anchored to. */
  position?: "top" | "bottom";
  /**
   * Fixed z-index, not additive. It has to sit *above* page content (otherwise
   * there is nothing behind it to blur) and *below* the nav's own background
   * (otherwise it blurs a flat colour and does nothing).
   */
  zIndex?: number;
  opacity?: number;
  className?: string;
};

/**
 * A static graduated `backdrop-filter` overlay.
 *
 * Two things make the falloff smooth, and both are per-layer rather than
 * shared. Every layer gets its own mask band, so each one's blur concentrates
 * in a different slice of the overlay, and every layer gets a weaker blur than
 * the one above it. Stacking the two is what turns N identical blurs into a
 * gradient instead of a single hard smudge.
 *
 * Deliberately not ported from the React Bits original: the animated/`scroll`
 * modes, their `requestAnimationFrame` loop, the scroll and pointer listeners,
 * the visibility `IntersectionObserver`, and the `responsive` config lookup.
 * The only consumer here is static page chrome, and a permanently running rAF
 * loop that recomputes blur on every frame is a poor trade for an effect that
 * never changes. `backdrop-filter` is a live filter, not a snapshot, so the
 * blur keeps tracking whatever scrolls underneath with no JavaScript at all.
 */
export function GradualBlur({
  divCount = 6,
  strength = 10,
  height = "5rem",
  position = "top",
  zIndex = 40,
  opacity = 1,
  className = "",
}: GradualBlurProps) {
  const top = position === "top";
  const band = 100 / divCount;
  // Overlap is what stops the seams between bands from reading as hard steps.
  const feather = band * 0.6;

  return (
    <div
      aria-hidden="true"
      className={`gradual-blur ${className}`.trim()}
      style={{ height, opacity, zIndex, [top ? "top" : "bottom"]: 0 }}
    >
      {Array.from({ length: divCount }, (_, i) => {
        const start = i * band;
        const end = start + band;
        // Weakest layer still needs enough blur to soften its own band, hence
        // the 0.15 floor rather than letting it reach zero.
        const layerStrength = strength * (1 - (i / divCount) * 0.85);
        // `to bottom` reads the same either way; only the anchor and the
        // direction the bands progress in differ.
        const direction = top ? "to bottom" : "to top";
        const maskImage = `linear-gradient(${direction}, transparent ${Math.max(
          0,
          start - feather
        )}%, black ${start}%, black ${end}%, transparent ${Math.min(
          100,
          end + feather
        )}%)`;

        return (
          <div
            key={i}
            style={
              {
                "--blur-intensity": layerStrength,
                maskImage,
                WebkitMaskImage: maskImage,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
