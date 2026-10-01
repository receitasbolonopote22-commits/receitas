"use client";

import { useState } from "react";

export default function PasswordField({ invalid }: { invalid: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor="senha" className="mb-2 block text-[1.05rem] font-semibold">
        Senha de acesso
      </label>
      <div className="relative">
        <input
          id="senha"
          name="senha"
          type={show ? "text" : "password"}
          required
          autoFocus
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid || undefined}
          className={`h-16 w-full rounded-2xl border bg-ink-2 pl-5 pr-28 text-[1.25rem] text-cream placeholder:text-muted/70 focus:border-saffron focus:outline-none ${invalid ? "border-rose" : "border-line"}`}
          placeholder="Digite a senha"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 h-12 -translate-y-1/2 rounded-xl px-3 text-[0.98rem] font-bold text-saffron hover:bg-ink-3"
          aria-pressed={show}
        >
          {show ? "Esconder" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}
