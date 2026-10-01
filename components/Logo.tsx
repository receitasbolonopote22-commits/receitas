import { site } from "@/site.config";

/** Marca própria: um prato visto de cima com a "luz" de açafrão. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--color-cream)" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="9" fill="var(--color-saffron)" />
      <path d="M11.5 14.5c1.5-3 5.5-4 8-2" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[1.45rem] leading-none font-semibold tracking-tight">
        {site.name}
      </span>
    </span>
  );
}
