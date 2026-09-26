"use client";

import InfiniteSpiral, { type InfiniteSpiralItem } from "./infinite-spiral";

/**
 * Renders the skills spiral. The marks are built by the server-rendered Skills
 * section and passed in, which keeps the site config on the server and makes
 * the data flow explicit.
 *
 * `items` identity matters: the spiral's effect depends on it, so a caller that
 * re-renders with a freshly built array restarts the animation. The Skills
 * section is a static server component and never re-renders on the client, so
 * the array is built once per server render and stays stable after that.
 */
export function SkillSpiral({ items }: { items: InfiniteSpiralItem[] }) {
  return (
    // No border and no fixed height: the frame fills whatever height the grid
    // row resolves to, which is set by the skill list beside it. The spiral
    // centres itself inside that frame, so a taller row means more breathing
    // room rather than a stretched or cropped helix.
    //
    // `min-h` is the floor, not the height. The cards are absolutely
    // positioned, so they add no height of their own: once the fixed heights
    // came off, a mobile frame (alone in its row) resolved to zero and
    // `overflow-hidden` clipped the whole spiral away. The floor gives it a box
    // there, and because a min-height can only raise the frame, it never caps
    // the desktop stretch to the list's height.
    <div className="relative h-full min-h-[380px] w-full overflow-hidden bg-surface/40">
      <InfiniteSpiral
        items={items}
        animationMode="all"
        speed={0.4}
        radius={150}
        cardWidth={92}
        cardHeight={92}
        verticalSpacing={54}
        perspective={1000}
        cardRadius={8}
        centerScale={1.22}
        edgeBlur={5}
        cardsPerTurn={7}
        cardTilt={0}
        grayscale={0}
        pauseOnHover
      />
    </div>
  );
}
