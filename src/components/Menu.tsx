"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScrum } from '@/context/ScrumContext';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  // { href: '/clients', label: 'Clientes', icon: '👥' },
  { href: '/sprint', label: 'Sprints', icon: '🏃‍♂️' },
];

export function Menu() {
  const pathname = usePathname();
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const detectViewport = () => {
      const width = window.innerWidth;
      const nextViewport: ViewportMode = width <= 640 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';

      setViewport((prev) => {
        if (prev !== nextViewport) {
          if (nextViewport !== 'desktop') {
            setCollapsed(false);
            setMobileOpen(false);
          }
        }
        return nextViewport;
      });
    };

    const raf = requestAnimationFrame(detectViewport);
    window.addEventListener('resize', detectViewport);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', detectViewport);
    };
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      if (viewport === 'desktop') {
        setCollapsed((state) => !state);
      } else {
        setMobileOpen((open) => !open);
      }
    };

    window.addEventListener('sidebar:toggle', handleToggle as EventListener);
    return () => window.removeEventListener('sidebar:toggle', handleToggle as EventListener);
  }, [viewport]);

  useEffect(() => {
    const widthValue = viewport === 'desktop' ? (collapsed ? '4.75rem' : '18rem') : '0px';
    document.documentElement.style.setProperty('--sidebar-width', widthValue);
  }, [collapsed, viewport]);

  useEffect(() => {
    if (viewport === 'mobile') {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, viewport]);

  const toggle = () => {
    if (viewport === 'desktop') {
      setCollapsed((state) => !state);
      return;
    }
    setMobileOpen((open) => !open);
  };

  const closeOnMobile = () => {
    if (viewport !== 'desktop') {
      setMobileOpen(false);
    }
  };

  const { clientes, selectedClienteId, setSelectedClienteId } = useScrum();
  const selectedCliente = useMemo(
    () => clientes?.find((client) => client.id === selectedClienteId) ?? null,
    [clientes, selectedClienteId],
  );

  function onSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value || null;
    setSelectedClienteId(id);
    if (viewport !== 'desktop') {
      setMobileOpen(false);
    }
  }

  const hideLabels = collapsed && viewport === 'desktop';
  const brandInitial = selectedCliente?.nome?.charAt(0)?.toUpperCase() ?? 'S';

  return (
    <>
      <aside
        className={`fixed left-6 top-6 bottom-6 sidebar flex flex-col gap-8 ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
        data-viewport={viewport}
        aria-hidden={viewport !== 'desktop' && !mobileOpen}
      >
        <button
          aria-label={viewport === 'desktop' ? (collapsed ? 'Expandir menu' : 'Recolher menu') : mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={toggle}
          className="toggle-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.05)] text-base text-white"
        >
          {viewport === 'desktop' ? (collapsed ? '☰' : '✕') : mobileOpen ? '✕' : '☰'}
        </button>

        <div className="flex h-full flex-col gap-6 pt-4">
          <header className="flex items-center gap-3 pr-10">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.08)] text-lg font-semibold text-white">
              {brandInitial}
            </span>
            {!hideLabels && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Sistema Scrum</span>
                <span className="text-xs text-[rgba(255,255,255,0.6)]">
                  {selectedCliente ? `Cliente ativo: ${selectedCliente.nome}` : 'Selecione um cliente'}
                </span>
              </div>
            )}
          </header>

          {!hideLabels && (
            <section className="space-y-3 pr-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.55)]">
                  Selecionar Cliente
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,36,0.92)] px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-[rgba(144,197,255,0.5)] focus:ring-2 focus:ring-[rgba(144,197,255,0.25)]"
                    value={selectedClienteId || ''}
                    onChange={onSelectChange}
                    aria-label="Selecionar cliente"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes &&
                      clientes.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.nome}
                        </option>
                      ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgba(255,255,255,0.6)]">
                    v
                  </span>
                </div>
              </div>

              <Link
                href="/clients"
                onClick={closeOnMobile}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
              >
                Gerenciar Clientes
              </Link>
            </section>
          )}

          <nav className={`flex ${hideLabels ? 'flex-col items-center gap-4' : 'flex-col gap-2 pr-6'}`} aria-label="Menu principal">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const commonProps = {
                href: item.href,
                onClick: closeOnMobile,
                title: hideLabels ? item.label : undefined,
                'aria-current': isActive ? 'page' : undefined,
              } as const;

              if (hideLabels) {
                return (
                  <Link
                    key={item.href}
                    {...commonProps}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg transition-colors ${
                      isActive
                        ? 'bg-[rgba(144,197,255,0.18)] text-white'
                        : 'text-[rgba(230,238,248,0.85)] hover:bg-[rgba(255,255,255,0.08)]'
                    }`}
                  >
                    <span aria-hidden>{item.icon}</span>
                    <span className="sr-only">{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  {...commonProps}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[rgba(144,197,255,0.15)] text-white'
                      : 'text-[rgba(230,238,248,0.85)] hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  <span className="text-lg" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <footer className="mt-auto pr-6">
            {hideLabels ? (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] text-sm font-semibold text-white">
                {brandInitial}
              </div>
            ) : (
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.45)]">
                  Status do Cliente
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {selectedCliente ? selectedCliente.nome : 'Nenhum cliente selecionado'}
                </p>
              </div>
            )}
          </footer>
        </div>
      </aside>

      <div className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
    </>
  );
}