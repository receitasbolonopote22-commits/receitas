"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconCompass, IconHeart, IconHome, IconLayers, IconSearch } from "./Icons";
import SearchOverlay from "./SearchOverlay";

const NAV = [
  { href: "/", label: "Início", Icon: IconHome },
  { href: "/explorar", label: "Explorar", Icon: IconCompass },
  { href: "/colecoes", label: "Coleções", Icon: IconLayers },
  { href: "/favoritos", label: "Favoritos", Icon: IconHeart },
];

export default function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const close = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/input|textarea/i.test((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-saffron focus:px-4 focus:py-2 focus:font-bold focus:text-ink">
        Pular para o conteúdo
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background,box-shadow] duration-300 ${
          scrolled ? "bg-ink/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-gradient-to-b from-ink/85 to-transparent"
        }`}
      >
        <div className="flex h-16 items-center gap-6 px-[var(--gutter)] sm:h-[4.5rem]">
          <Link href="/" aria-label="Página inicial" className="shrink-0 rounded-lg">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.slice(1).map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active(href) ? "page" : undefined}
                    className="rounded-full px-4 py-2.5 text-[1.02rem] font-semibold text-cream-2 transition-colors hover:text-cream aria-[current=page]:text-saffron"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-12 items-center gap-3 rounded-full border border-line bg-ink-2/70 px-4 text-left text-muted backdrop-blur transition-colors hover:border-saffron/60 hover:text-cream md:w-72"
            aria-label="Buscar receitas"
          >
            <IconSearch size={22} />
            <span className="hidden text-[1rem] md:inline">Buscar receitas...</span>
          </button>
        </div>
      </header>

      {/* Navegação inferior no celular: botões grandes, sempre ao alcance do polegar */}
      <nav aria-label="Navegação" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className="flex h-16 flex-col items-center justify-center gap-1 text-[0.8rem] font-semibold text-muted aria-[current=page]:text-saffron"
              >
                <Icon size={24} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <SearchOverlay open={searchOpen} onClose={close} />
    </>
  );
}
