"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useScrum } from '@/context/ScrumContext';

export function Menu() {
  // initialize to false to keep server and initial client render consistent
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // now that we're mounted we can read window and update state
    const mobile = window.innerWidth <= 640;
    const small = window.innerWidth <= 1024;

    // Avoid synchronous setState inside effect body to reduce cascading renders
    const raf = requestAnimationFrame(() => {
      setIsMobile(mobile);
      setCollapsed(small);
      // when switching to mobile, ensure overlay is closed
      if (mobile) setMobileOpen(false);
      // initialize CSS var for desktop size
      document.documentElement.style.setProperty('--sidebar-width', small ? '4.5rem' : '18rem');
    });

    const onResize = () => {
      const mobileR = window.innerWidth <= 640;
      const smallR = window.innerWidth <= 1024;
      // schedule updates via RAF as well
      requestAnimationFrame(() => {
        setIsMobile(mobileR);
        setCollapsed(smallR);
        if (mobileR) setMobileOpen(false);
        document.documentElement.style.setProperty('--sidebar-width', smallR ? '4.5rem' : '18rem');
      });
    };

    window.addEventListener('resize', onResize);

    // listen for header toggle events
    const onHeaderToggle = () => {
      // determine mobile status directly to avoid stale closure
      const mobileNow = window.innerWidth <= 640;
      if (mobileNow) {
        setMobileOpen((s) => !s);
      } else {
        setCollapsed((s) => {
          const next = !s;
          document.documentElement.style.setProperty('--sidebar-width', next ? '4.5rem' : '18rem');
          return next;
        });
      }
    };
    window.addEventListener('sidebar:toggle', onHeaderToggle as EventListener);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('sidebar:toggle', onHeaderToggle as EventListener);
    };
  }, []);

  const toggle = () => {
    if (isMobile) {
      setMobileOpen((s) => !s);
      return;
    }
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty('--sidebar-width', next ? '4.5rem' : '18rem');
  };

  // use global selection from context
  const { clientes, selectedClienteId, setSelectedClienteId } = useScrum();

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value || null;
    setSelectedClienteId(id);
  }

  return (
    <>
      <aside className={`fixed left-6 top-6 bottom-6 sidebar p-6 flex flex-col justify-between ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <button aria-label="Toggle menu" onClick={toggle} className="toggle-btn absolute right-3 top-3 p-1 rounded-md bg-[rgba(255,255,255,0.04)] text-sm">
          {isMobile ? (mobileOpen ? '✕' : '☰') : (collapsed ? '☰' : '✕')}
        </button>
        <div>
          <nav className="flex flex-col gap-3">
            {/* Client selector placed in the menu */}
          <div className="mb-6 nav-label">
            <label className="block text-sm font-medium mb-2">Selecionar Cliente</label>
            <select
              className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded px-3 py-2 mb-4"
              value={selectedClienteId || ''}
              onChange={onSelectChange}
              aria-label="Selecionar cliente"
            >
              <option value="">Selecione um cliente</option>
              {clientes && clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <a className="text-blue-300 hover:underline" href="/clients">Gerenciar Clientes</a>
          </div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <span className="w-6 h-6 flex items-center justify-center">🏠</span>
            <span className="text-sm nav-label">Dashboard</span>
          </Link>

          <Link href="/clients" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <span className="w-6 h-6 flex items-center justify-center">👥</span>
            <span className="text-sm nav-label">Clientes</span>
          </Link>

          <Link href="/sprint" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <span className="w-6 h-6 flex items-center justify-center">🏃‍♂️</span>
            <span className="text-sm nav-label">Sprints</span>
          </Link> 
        </nav>
          
      </div>
    </aside>

      {/* overlay for mobile when sidebar is open */}
      <div className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
    </>
  );
}