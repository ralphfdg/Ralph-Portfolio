"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * A helix of cards that travels on its own, can be dragged, and responds to
 * page scroll. Adapted from the React Bits `InfiniteSpiral` for this codebase.
 *
 * Six deliberate departures from upstream, each load-bearing here:
 *
 * 1. The redraw loop stops when the spiral is off screen. Upstream reschedules
 *    `requestAnimationFrame` unconditionally forever and only zeroes the
 *    automatic speed through `visibleRef`, so an invisible spiral still costs a
 *    frame per tick for the life of the page. Same reasoning as `DotGrid`.
 * 2. `items` must be referentially stable. The effect depends on
 *    `normalizedItems`, which is memoised on `items`, so an array literal built
 *    during render would re-run the whole effect on every render. Callers hold
 *    the array at module scope.
 * 3. Cards are dark, not the upstream translucent white. This page is near-black
 *    and every mark is a light monochrome glyph, so a white card would invert
 *    the contrast and leave nothing readable.
 * 4. Images use `contain` with padding, not `cover`. These are square brand
 *    marks, and `cover` would crop them to the corners.
 * 5. Raw `<img>`, with a scoped lint exemption. `next/image` injects its own
 *    wrapper and intrinsic sizing, which fights the per-frame transform this
 *    component writes directly onto the card. Alt text is preserved through
 *    the card's own `aria-label` and a visually hidden span.
 * 6. The loop honours `prefers-reduced-motion` itself. The site's global
 *    reduced-motion rule clamps CSS transition and animation durations, but
 *    this spiral is driven by inline styles from JavaScript, so only a
 *    `matchMedia` check can stop it.
 */

export interface InfiniteSpiralItem {
  id?: string | number;
  src: string;
  alt?: string;
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  label?: string;
  /** Rendered instead of `src` when a mark has no usable image. */
  text?: string;
}

export interface InfiniteSpiralProps {
  items?: Array<string | InfiniteSpiralItem>;
  speed?: number;
  direction?: "up" | "down";
  animationMode?: "auto" | "drag" | "scroll" | "all";
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  verticalSpacing?: number;
  perspective?: number;
  cardsPerTurn?: number;
  rotation?: number;
  cardTilt?: number;
  cardRadius?: number;
  centerScale?: number;
  edgeFade?: number;
  edgeBlur?: number;
  pauseOnHover?: boolean;
  imageFit?: CSSProperties["objectFit"];
  grayscale?: number;
  className?: string;
}

type NormalizedItem = InfiniteSpiralItem & { alt: string };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const modulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

const InfiniteSpiral = ({
  items = [],
  speed = 0.55,
  direction = "up",
  animationMode = "auto",
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  cardRadius = 10,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  pauseOnHover = true,
  imageFit = "contain",
  grayscale = 0,
  className = "",
}: InfiniteSpiralProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | HTMLDivElement | null>>([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const hoveredRef = useRef(false);
  const visibleRef = useRef(true);
  const draggingRef = useRef(false);
  const lastPointerYRef = useRef(0);
  const dragMovedRef = useRef(false);
  const frameRef = useRef(0);

  const normalizedItems = useMemo<NormalizedItem[]>(
    () =>
      items.map((item, index) =>
        typeof item === "string"
          ? { src: item, alt: `Spiral image ${index + 1}` }
          : { alt: `Spiral image ${index + 1}`, ...item },
      ),
    [items],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || normalizedItems.length === 0) return;

    let previousTime = performance.now();
    let bounds = root.getBoundingClientRect();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scrollEnabled = animationMode === "scroll" || animationMode === "all";
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.55;
    let lastScrollY = window.scrollY;

    const resizeObserver = new ResizeObserver(() => {
      bounds = root.getBoundingClientRect();
    });
    resizeObserver.observe(root);

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (!scrollEnabled || !visibleRef.current || scrollDelta === 0) return;
      targetProgressRef.current += clamp(
        (scrollDelta * scrollSpeedMultiplier) /
          Math.max(verticalSpacing * 2, 1),
        -1.5,
        1.5,
      );
    };

    const render = (time: number) => {
      // Departure 1: no reschedule while off screen. The observer below starts
      // the loop again on the way back in, so nothing is lost but the frames.
      if (!visibleRef.current) {
        frameRef.current = 0;
        return;
      }

      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const autoEnabled = animationMode === "auto" || animationMode === "all";
      const motionPaused =
        draggingRef.current || (pauseOnHover && hoveredRef.current);
      const directionMultiplier = direction === "down" ? -1 : 1;
      const desiredAutoSpeed =
        autoEnabled && !reducedMotion.matches && !motionPaused
          ? speed * directionMultiplier
          : 0;
      const speedBlend = 1 - Math.exp(-delta * 7);
      autoSpeedRef.current +=
        (desiredAutoSpeed - autoSpeedRef.current) * speedBlend;
      targetProgressRef.current += autoSpeedRef.current * delta;

      const followBlend = 1 - Math.exp(-delta * (draggingRef.current ? 22 : 11));
      progressRef.current +=
        (targetProgressRef.current - progressRef.current) * followBlend;

      const count = normalizedItems.length;
      const half = count / 2;
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const fit = Math.min(1, width / (cardWidth * 2.8), height / (cardHeight * 2.35));
      const responsiveRadius = Math.min(radius, Math.max(72, width * 0.36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const turnSize = Math.max(cardsPerTurn, 1);

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const offset = modulo(index - progressRef.current + half, count) - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angle = offset * (360 / turnSize) + rotation;
        const angleRadians = (angle * Math.PI) / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        const visualScale = scale * depthScale;
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = edgeBlur * smoothstep(0.35, 1, edge);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * verticalSpacing * fit}px, 0) rotateZ(${cardTilt}deg) scale(${visualScale})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
        card.style.zIndex = String(Math.round(depth * 100000) + index);
        card.style.pointerEvents = opacity > 0.25 ? "auto" : "none";
      });

      frameRef.current = requestAnimationFrame(render);
    };

    const start = () => {
      if (frameRef.current !== 0) return;
      previousTime = performance.now();
      frameRef.current = requestAnimationFrame(render);
    };

    const stop = () => {
      if (frameRef.current === 0) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) start();
      else stop();
    });
    intersectionObserver.observe(root);

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Reduced motion still gets one painted frame, so the spiral is visible as a
    // static arrangement rather than an empty box, but it never travels.
    if (reducedMotion.matches) render(performance.now());
    else start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    normalizedItems,
    speed,
    direction,
    animationMode,
    radius,
    perspective,
    cardWidth,
    cardHeight,
    verticalSpacing,
    cardsPerTurn,
    rotation,
    cardTilt,
    centerScale,
    edgeFade,
    edgeBlur,
    pauseOnHover,
  ]);

  // Upstream drove card geometry from `--spiral-*` custom properties consumed by
  // utility classes. Card size is set directly on each card below instead, so
  // those variables are not declared here.
  const rootStyle = {
    perspective: `${perspective}px`,
    cursor:
      animationMode === "drag" || animationMode === "all" ? "grab" : "default",
    touchAction:
      animationMode === "drag" || animationMode === "all" ? "pan-x" : "auto",
    userSelect:
      animationMode === "drag" || animationMode === "all" ? "none" : "auto",
  } as CSSProperties;

  const dragEnabled = animationMode === "drag" || animationMode === "all";

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = dragEnabled ? "grab" : "default";
  };

  const setCardRef =
    (index: number) => (node: HTMLAnchorElement | HTMLDivElement | null) => {
      cardRefs.current[index] = node;
    };

  const cardStyle: CSSProperties = {
    width: cardWidth,
    height: cardHeight,
    borderRadius: cardRadius,
  };

  const logoStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: imageFit,
    filter: `grayscale(${Math.min(1, Math.max(0, grayscale))})`,
    // The mark fills its card outright, so it is drawn straight onto the card
    // fill. Every asset is a square 24x24 viewBox and the cards are square, so
    // `contain` at 100% fills the card exactly: no padding, no letterboxing.
    // `borderRadius` is kept on the image rather than `overflow-hidden` on the
    // card, which would flatten the card's `preserve-3d`.
    //
    // The fills are not all legible on their own. Measured against #17171c,
    // Next.js (#000000) sat at 1.18:1, GitHub (#181717) and Express (#0A0A0A)
    // at about 1:1, SQLite at 1.50:1, CSS3 at 2.12:1, C# at 2.25:1 and Flutter
    // at 2.39:1. The three monochrome brands ship the white they use as their
    // own dark-mode logo and the other four are lifted along the line to white,
    // which preserves hue. `logo-colors.test.ts` holds all 23 above 3:1.
    borderRadius: cardRadius,
  };

  // Departures 3 and 4: a dark card with a hairline border, matching the page's
  // panel language, with the mark filling it edge to edge.
  //
  // `opacity-0` is the no-JavaScript state. Every card is absolutely centred in
  // the server-rendered markup, and the transforms that spread them along the
  // helix are written by the first animation frame, so without JavaScript they
  // would all sit on the same pixel as one opaque pile. The first `render` pass
  // assigns an inline opacity to every card, which outranks this class, so the
  // spiral appears the moment it is laid out and no frame of the pile is ever
  // painted. What is left without JavaScript is the skill list, which is real
  // content rather than decoration, and an empty panel beside it.
  const itemClassName =
    "absolute left-1/2 top-1/2 flex items-center justify-center border border-line bg-surface-2 opacity-0 [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform,opacity,filter]";

  return (
    <div
      ref={rootRef}
      className={`relative isolate h-full w-full overflow-hidden ${className}`}
      style={rootStyle}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onPointerDown={(event) => {
        if (!dragEnabled || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        lastPointerYRef.current = event.clientY;
        targetProgressRef.current = progressRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.style.cursor = "grabbing";
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const pointerDelta = event.clientY - lastPointerYRef.current;
        lastPointerYRef.current = event.clientY;
        if (Math.abs(pointerDelta) > 0.5) dragMovedRef.current = true;
        targetProgressRef.current -= pointerDelta / Math.max(verticalSpacing, 1);
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={(event) => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        dragMovedRef.current = false;
      }}
    >
      <div
        className="absolute inset-0 [transform-style:preserve-3d]"
        role="list"
        aria-label="Skills"
      >
        {normalizedItems.map((item, index) => {
          const content = item.text ? (
            // A monogram is real text, so it inherits the page's colour tokens
            // and stays legible if the palette changes.
            <span
              aria-hidden="true"
              className="font-mono text-[0.8125rem] font-medium uppercase tracking-[0.06em] text-fg"
            >
              {item.text}
            </span>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element --
               next/image injects its own wrapper and intrinsic sizing, which
               fights the per-frame transform written onto the card. The card
               carries the accessible name instead. */
            <img
              src={item.src}
              alt=""
              draggable={false}
              className="select-none"
              style={logoStyle}
            />
          );

          const body = (
            <>
              {content}
              <span className="sr-only">{item.alt}</span>
            </>
          );

          return item.href ? (
            <a
              key={item.id ?? `${item.src}-${index}`}
              ref={setCardRef(index)}
              className={itemClassName}
              style={cardStyle}
              href={item.href}
              target={item.target}
              rel={item.target === "_blank" ? "noreferrer" : undefined}
              role="listitem"
              aria-label={item.label ?? item.alt}
            >
              {body}
            </a>
          ) : (
            <div
              key={item.id ?? `${item.src}-${index}`}
              ref={setCardRef(index)}
              className={itemClassName}
              style={cardStyle}
              role="listitem"
              aria-label={item.label ?? item.alt}
            >
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteSpiral;
