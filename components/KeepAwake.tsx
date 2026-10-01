"use client";

import { useEffect, useRef, useState } from "react";
import { IconSun } from "./Icons";

/** Mantém a tela do celular acesa enquanto a pessoa cozinha (quando o aparelho permite). */
export default function KeepAwake() {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const lock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detecção de recurso do navegador após montar
    setSupported(typeof navigator !== "undefined" && "wakeLock" in navigator);
    return () => {
      lock.current?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    const reacquire = async () => {
      if (document.visibilityState === "visible" && on) {
        try { lock.current = await navigator.wakeLock.request("screen"); } catch { setOn(false); }
      }
    };
    document.addEventListener("visibilitychange", reacquire);
    return () => document.removeEventListener("visibilitychange", reacquire);
  }, [on]);

  if (!supported) return null;
  const toggle = async () => {
    if (on) {
      await lock.current?.release().catch(() => {});
      lock.current = null;
      setOn(false);
    } else {
      try {
        lock.current = await navigator.wakeLock.request("screen");
        setOn(true);
      } catch {
        setOn(false);
      }
    }
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={on} className={`chip !min-h-12 ${on ? "" : ""}`}>
      <IconSun size={20} /> {on ? "Tela sempre acesa: ligado" : "Manter tela acesa"}
    </button>
  );
}
