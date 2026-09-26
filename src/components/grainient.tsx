"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

/**
 * An animated brand gradient, and the hero's entire background.
 *
 * Adapted from the React Bits `Grainient`, which supplies the field, the warp
 * and the grain. What this file changes is everything around the shader: the
 * six conventions `SoftAurora` established for a WebGL component in this
 * codebase, plus two more. The reasoning for each is at its call site.
 *
 * Design record: docs/superpowers/specs/2026-09-26-ralph-portfolio-grainient-design.md
 */

interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  lightMode?: boolean;
  className?: string;
}

/* Six-digit hex only, which is all the palette uses. Kept as a guard rather than
   a parser: a malformed value would otherwise reach the shader as NaN and the
   blend would collapse to a flat wash, which reads as a broken hero rather than
   a typo. Upstream's own guard returns white, so the failure lands on the
   visible side. */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

const vertexShader = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uLightMode;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  if(uLightMode>0.5){
    float energy=max(max(col.r,col.g),col.b);
    vec3 hue=col/max(energy,0.001);
    float chroma=length(col-vec3(dot(col,vec3(0.333333))));
    float coverage=clamp(0.12+chroma*1.15+energy*0.18,0.0,0.88);
    col=mix(vec3(1.0),clamp(hue*0.58+col*0.18,0.0,1.0),coverage);
  }

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

/**
 * The renderer, program and mesh, keyed by the element they were mounted into.
 *
 * This is what lets the second effect below write uniforms without ever
 * rebuilding the WebGL context. Upstream's version rebuilds everything when a
 * prop changes, which for a full-viewport shader means a visible flash and a
 * fresh GL context per keystroke in a future control panel.
 */
type GrainientCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  gl: InstanceType<typeof Renderer>["gl"];
};

const ctxMap = new WeakMap<HTMLDivElement, GrainientCtx>();

/** Every prop that reaches the shader, with the same optionality as the props. */
type GrainientUniformValues = Required<Omit<GrainientProps, "className">>;

/**
 * Writes props into an already-built program.
 *
 * Called from the mount effect before the first render as well as from the
 * update effect. The mount effect has to draw once to size the drawing buffer,
 * and that draw happens before any later effect would run, so without this the
 * hero would put a single frame of the initial uniform values on screen: white,
 * because that is what the colours are seeded with. The alternative is seeding
 * twenty-four uniforms twice in two places and hoping they stay in step.
 */
function applyUniforms(
  program: GrainientCtx["program"],
  values: GrainientUniformValues,
) {
  const u = program.uniforms as Record<string, { value: unknown }>;

  u.uTimeSpeed.value = values.timeSpeed;
  u.uColorBalance.value = values.colorBalance;
  u.uWarpStrength.value = values.warpStrength;
  u.uWarpFrequency.value = values.warpFrequency;
  u.uWarpSpeed.value = values.warpSpeed;
  u.uWarpAmplitude.value = values.warpAmplitude;
  u.uBlendAngle.value = values.blendAngle;
  u.uBlendSoftness.value = values.blendSoftness;
  u.uRotationAmount.value = values.rotationAmount;
  u.uNoiseScale.value = values.noiseScale;
  u.uGrainAmount.value = values.grainAmount;
  u.uGrainScale.value = values.grainScale;
  u.uGrainAnimated.value = values.grainAnimated ? 1.0 : 0.0;
  u.uContrast.value = values.contrast;
  u.uGamma.value = values.gamma;
  u.uSaturation.value = values.saturation;
  u.uCenterOffset.value = new Float32Array([values.centerX, values.centerY]);
  u.uZoom.value = values.zoom;
  u.uColor1.value = new Float32Array(hexToRgb(values.color1));
  u.uColor2.value = new Float32Array(hexToRgb(values.color2));
  u.uColor3.value = new Float32Array(hexToRgb(values.color3));
  u.uLightMode.value = values.lightMode ? 1.0 : 0.0;
}

export default function Grainient({
  timeSpeed = 1.0,
  colorBalance = 0.0,
  warpStrength = 1.5,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.06,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.2,
  /*
   * The palette and gamma below, and why they are not the brand's.
   *
   * The hero's copy sits directly on this field, so the palette is bounded from
   * above by WCAG rather than by taste. Two of the three text colours set the
   * ceiling, and the smaller one is the binding constraint:
   *
   *   eyebrow  text-accent-bright #9db4e3  L 0.4507  -> field <= 0.0619
   *   hook     muted-bright       #c2c4cd  L 0.5540  -> field <= 0.0841
   *   heading  text-fg            #f4f4f1  L 0.9000  -> field <= 0.1611
   *
   * So the field is allowed to be genuinely colourful, but not bright. The three
   * stops are a violet ramp: a saturated violet highlight, a deep indigo body and
   * a near-black base that keeps the bottom of the hero anchored. Gamma sits at
   * 1.05, which is to say the palette is rendered essentially as written; the
   * colour is doing the work, not a crush.
   *
   * `muted-bright` on the hook is load-bearing, not cosmetic. With the original
   * `text-muted` (#8b8b95, L 0.2613) the cap falls to 0.0192, below
   * `accent-deep` (#1c2547, L 0.0203), and the only palettes that fit under it
   * are near-black: measured median chroma 42 against 124 here, at a fifth of
   * the luminance. That is the version that read as too dark.
   *
   * Verified over 1920x1080, 1440x900, 1366x768 and 1280x720 at five points
   * through the animation, worst pixel in each rectangle: eyebrow 4.60, heading
   * 6.82, hook 5.19. The eyebrow is the tight one and it is tight because it is
   * small, so a single bright grain fleck is enough to move it; the margin
   * there is deliberately thin and is the thing to re-check if the copy moves.
   */
  gamma = 1.05,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 1.1,
  color1 = "#619ae9",
  color2 = "#2a1c7d",
  color3 = "#0b0826",
  lightMode = false,
  className = "",
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Build the context once, and never rebuild it.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        // dpr is capped for the same reason SoftAurora caps it: this is a
        // full-viewport fragment shader running three colour blends and a grain
        // pass, and at dpr 3 that is a lot of fragments for a decoration.
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
    } catch {
      // No WebGL at all. The hero keeps its `bg-bg`, and the atmosphere spec's
      // no-WebGL case is the CSS gradient alone.
      return;
    }

    /*
     * The guard that makes or breaks this component.
     *
     * ogl tries `webgl2` and silently falls back to `webgl` (Renderer.js:43-45),
     * and its `Program` hands the source to `shaderSource` verbatim
     * (Program.js:60) — no `#version` is injected and nothing is transpiled
     * from GLSL 1 to GLSL 3. These shaders declare `#version 300 es`, so on a
     * WebGL 1 context they fail to compile and the hero renders as an empty
     * box with nothing but a `console.warn` to show for it.
     *
     * Checking `isWebgl2` before building the Program makes that failure
     * deterministic, and lets the hero's own `bg-bg` carry the section.
     */
    if (!renderer.isWebgl2) {
      // Hand the context back rather than leaving it to the collector. The
      // canvas was never appended, so there is no DOM to clean up, but browsers
      // cap live contexts and a dropped one still counts until it is lost.
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    // Past the guard this is a WebGL 2 context, but ogl types `gl` as the union
    // either way. Keeping ogl's own type matters: it is the intersection that
    // carries `renderer` and `canvas`, which `Triangle`, `Program` and `Mesh`
    // all require.
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uTimeSpeed: { value: 0.25 },
        uColorBalance: { value: 0.0 },
        uWarpStrength: { value: 1.0 },
        uWarpFrequency: { value: 5.0 },
        uWarpSpeed: { value: 2.0 },
        uWarpAmplitude: { value: 50.0 },
        uBlendAngle: { value: 0.0 },
        uBlendSoftness: { value: 0.05 },
        uRotationAmount: { value: 500.0 },
        uNoiseScale: { value: 2.0 },
        uGrainAmount: { value: 0.06 },
        uGrainScale: { value: 2.0 },
        uGrainAnimated: { value: 0.0 },
        uContrast: { value: 1.2 },
        uGamma: { value: 1.0 },
        uSaturation: { value: 1.0 },
        uCenterOffset: { value: new Float32Array([0, 0]) },
        uZoom: { value: 1.1 },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
        uLightMode: { value: 0.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, gl });

    // Before the first render, not after: `setSize` draws, and that draw reads
    // the uniforms as they stand right now.
    applyUniforms(program, {
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
      color1,
      color2,
      color3,
      lightMode,
    });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      // Mutated in place, not reassigned: ogl reads `uniform.value` every frame,
      // so a new array here would be uploaded, but reusing the buffer keeps the
      // GC out of the render loop.
      const res = (program.uniforms.iResolution as { value: Float32Array })
        .value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    // ResizeObserver on its own container, not a window listener, so the field
    // tracks the hero's box rather than every resize on the page.
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    let frame = 0;
    let onScreen = true;
    let pageVisible = !document.hidden;
    const t0 = performance.now();

    const draw = (time: number) => {
      (program.uniforms.iTime as { value: number }).value = (time - t0) * 0.001;
      renderer.render({ scene: mesh });
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      draw(time);
    };

    const start = () => {
      if (frame === 0 && onScreen && pageVisible) {
        frame = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    // The hero is a full screen, so this loop is the most expensive on the
    // page. Offscreen it stops; in a backgrounded tab it stops too, which the
    // IntersectionObserver alone cannot see.
    const sync = () => {
      if (onScreen && pageVisible) {
        start();
      } else {
        stop();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Under reduced motion, render exactly one frame and never start the loop.
    // Not a hidden canvas and not a 0.01ms hack, which would still leave a rAF
    // running.
    if (reduceMotion.matches) {
      draw(0);
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ctxMap.delete(container);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // The prop read above is the initial value only, and deliberately so: the
    // second effect keeps the uniforms in step from here on. Depending on them
    // would tear down and rebuild the WebGL context on every change, which for
    // a full-viewport shader is a visible flash and a fresh GL context per
    // keystroke in a future control panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Props become uniforms. No teardown, no rebuild, no GPU allocation.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;

    applyUniforms(ctx.program, {
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
      color1,
      color2,
      color3,
      lightMode,
    });
  }, [
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
    color1,
    color2,
    color3,
    lightMode,
  ]);

  // The canvas can never intercept a click meant for the page.
  return (
    <div
      ref={containerRef}
      className={`pointer-events-none relative h-full w-full overflow-hidden ${className}`.trim()}
    />
  );
}
