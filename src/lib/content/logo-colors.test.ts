import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The skill cards are filled by the mark itself, so each SVG is drawn straight
 * onto the card. This proves the assets stay legible against that fill rather
 * than trusting a table of hexes maintained by hand.
 */
const LOGO_DIR = join(process.cwd(), "public", "logos");
const CARD_FILL = "#17171c";
const MIN_RATIO = 3;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  return (
    0.2126 * channel(parseInt(h.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(h.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(h.slice(4, 6), 16))
  );
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [high, low] = la > lb ? [la, lb] : [lb, la];
  return (high + 0.05) / (low + 0.05);
}

const logos = readdirSync(LOGO_DIR).filter((file) => file.endsWith(".svg"));

function sourceOf(file: string): string {
  return readFileSync(join(LOGO_DIR, file), "utf8");
}

function fillOf(file: string): string {
  return /fill="(#[0-9a-fA-F]{6})"/.exec(sourceOf(file))?.[1] ?? "";
}

describe("skill logo assets", () => {
  it("ships one logo per authored skill", () => {
    expect(logos, `found ${logos.length} logos`).toHaveLength(23);
  });

  it("gives every logo an explicit hex fill", () => {
    const missing = logos.filter(
      (file) => !/fill="#[0-9a-fA-F]{6}"/.test(sourceOf(file)),
    );
    expect(missing, `no hex fill: ${missing.join(", ")}`).toEqual([]);
  });

  it("keeps every mark legible on the card it is drawn on", () => {
    const tooDark = logos
      .map((file) => ({ file, ratio: contrast(fillOf(file), CARD_FILL) }))
      .filter((entry) => entry.ratio < MIN_RATIO)
      .map((entry) => `${entry.file} at ${entry.ratio.toFixed(2)}:1`);
    expect(
      tooDark,
      `below ${MIN_RATIO}:1 on ${CARD_FILL}:\n${tooDark.join("\n")}`,
    ).toEqual([]);
  });
});
