import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconSearch = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconHeart = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.7 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.2 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
  </svg>
);
export const IconHome = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3.5 10.5 12 4l8.5 6.5" /><path d="M5.5 9v10.5h13V9" /><path d="M10 19.5v-5h4v5" /></svg>
);
export const IconCompass = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>
);
export const IconLayers = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5Z" /><path d="m3.5 12 8.5 4.5 8.5-4.5" /><path d="m3.5 16 8.5 4.5 8.5-4.5" /></svg>
);
export const IconClock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconUsers = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" /><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.3c1.6.6 2.7 2.2 3 4.7" /></svg>
);
export const IconShare = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3.5v11" /><path d="m7.5 8 4.5-4.5L16.5 8" /><path d="M5 12.5v6.5h14v-6.5" /></svg>
);
export const IconPlay = ({ size, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
);
export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} strokeWidth={2.6} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4.5 12h15" /><path d="m13.5 6 6 6-6 6" /></svg>
);
export const IconArrowLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M19.5 12h-15" /><path d="m10.5 6-6 6 6 6" /></svg>
);
export const IconSun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></svg>
);
export const IconInfo = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.2" /></svg>
);
export const IconLeaf = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15" /><path d="M5 19c3-4 6-6.5 10-8.5" /></svg>
);

/* Ícones ilustrativos para capas sem foto */
export const ArtPlate = (p: P) => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <circle cx="60" cy="62" r="34" /><circle cx="60" cy="62" r="24" opacity=".5" />
    <path d="M14 30v22a6 6 0 0 0 6 6v34M20 30v18M26 30v22a6 6 0 0 1-6 6" /><path d="M104 30c-6 0-8 10-8 20s3 10 8 10v32" />
  </svg>
);
export const ArtCake = (p: P) => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M22 98h76M28 98V64h64v34" /><path d="M28 76c6 0 6 5 12 5s6-5 12-5 6 5 12 5 6-5 12-5 6 5 12 5" />
    <path d="M36 64V48h48v16" /><path d="M60 48V34" /><path d="M60 26c3 3 3 6 0 8-3-2-3-5 0-8Z" />
  </svg>
);
export const ArtCup = (p: P) => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M36 34h48l-6 66H42l-6-66Z" /><path d="M38 52h44" opacity=".6" /><path d="M72 34l10-18h12" /><circle cx="54" cy="70" r="3" /><circle cx="64" cy="82" r="2.5" />
  </svg>
);
export const ArtBowl = (p: P) => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M18 58h84c0 22-18 38-42 38S18 80 18 58Z" /><path d="M48 96h24" /><path d="M46 44c0-6 6-6 6-12M60 44c0-6 6-6 6-12M74 44c0-6 6-6 6-12" opacity=".7" />
  </svg>
);
export const ArtBread = (p: P) => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M22 80c0-22 17-40 38-40s38 18 38 40v6H22v-6Z" /><path d="M42 54l8 10M58 50l8 10M74 54l8 10" opacity=".7" />
  </svg>
);
export const ArtSun = (p: P) => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M20 84h80" /><path d="M36 84a24 24 0 0 1 48 0" /><path d="M60 36v-12M30 48l-8-8M90 48l8-8M24 70H12M108 70H96" />
  </svg>
);
