"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Menu() {
  const [collapsed, setCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : false));

  useEffect(() => {
    // initialize CSS var
    const isSmall = typeof window !== 'undefined' && window.innerWidth <= 1024;
    document.documentElement.style.setProperty('--sidebar-width', isSmall ? '4.5rem' : '18rem');

    const onResize = () => {
      const small = window.innerWidth <= 1024;
      if (small) {
        setCollapsed(true);
        document.documentElement.style.setProperty('--sidebar-width', '4.5rem');
      } else {
        setCollapsed(false);
        document.documentElement.style.setProperty('--sidebar-width', '18rem');
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty('--sidebar-width', next ? '4.5rem' : '18rem');
  };

  return (
    <aside className={`fixed left-6 top-6 bottom-6 sidebar p-6 flex flex-col justify-between ${collapsed ? 'collapsed' : ''}`}>
      <button aria-label="Toggle menu" onClick={toggle} className="toggle-btn absolute right-3 top-3 p-1 rounded-md bg-[rgba(255,255,255,0.04)] text-sm">
        {collapsed ? '☰' : '✕'}
      </button> 
      <div>  
        <nav className="flex flex-col gap-3">
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
  );
}