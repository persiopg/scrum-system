"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useScrum, Cliente, Sprint, Task } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';

type Filtered = { clientes: Cliente[]; sprints: Sprint[]; tasks: Task[] };

export default function HeaderSearch() {
  const { clientes, sprints, tasks } = useScrum();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [filtered, setFiltered] = useState<Filtered>({ clientes: [], sprints: [], tasks: [] });
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setFiltered({ clientes: [], sprints: [], tasks: [] });
      setResultsOpen(false);
      return;
    }

    const q = query.toLowerCase();
    const timeout = setTimeout(() => {
      const fc = clientes.filter((c: Cliente) => c.nome && c.nome.toLowerCase().includes(q)).slice(0, 6);
      const fs = sprints.filter((s: Sprint) => s.name && s.name.toLowerCase().includes(q)).slice(0, 8);
      const ft = tasks.filter((t: Task) => (t.description && t.description.toLowerCase().includes(q)) || (t.id && t.id.toLowerCase().includes(q))).slice(0, 10);
      setFiltered({ clientes: fc, sprints: fs, tasks: ft });
      setResultsOpen(fc.length + fs.length + ft.length > 0);
      setActiveIndex(-1);
    }, 220);

    return () => clearTimeout(timeout);
  }, [query, clientes, sprints, tasks]);

  // click outside to close
  useEffect(() => {
    function handleDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!wrapperRef.current.contains(e.target)) {
        setResultsOpen(false);
      }
    }
    document.addEventListener('click', handleDoc);
    return () => document.removeEventListener('click', handleDoc);
  }, []);

  // keyboard navigation
  const selectByFlattenIndex = useCallback((flatIndex: number) => {
    const cLen = filtered.clientes?.length || 0;
    const sLen = filtered.sprints?.length || 0;
    if (flatIndex < cLen) {
      router.push(`/clients`);
      setResultsOpen(false);
      return;
    }
    if (flatIndex < cLen + sLen) {
      const s = filtered.sprints[flatIndex - cLen];
      router.push(`/sprint/${s.id}/tasks`);
      setResultsOpen(false);
      return;
    }
    const t = filtered.tasks[flatIndex - cLen - sLen];
    router.push(`/sprint/${t.sprintId}/tasks/${t.id}`);
    setResultsOpen(false);
  }, [filtered, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!resultsOpen) return;
      const total = (filtered.clientes?.length || 0) + (filtered.sprints?.length || 0) + (filtered.tasks?.length || 0);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(total - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(-1, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0) {
          selectByFlattenIndex(activeIndex);
        } else {
          // fallback: go to first sprint or clients
          if (filtered.sprints?.length) {
            const s = filtered.sprints[0];
            router.push(`/sprint/${s.id}/tasks`);
            setResultsOpen(false);
          } else if (filtered.clientes?.length) {
            router.push(`/clients`);
            setResultsOpen(false);
          }
        }
      } else if (e.key === 'Escape') {
        setResultsOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resultsOpen, filtered, activeIndex, selectByFlattenIndex, router]);

  // Helper: map flat index to item and navigate (selectByFlattenIndex is provided above as a useCallback)

  const handleItemClick = useCallback((type: 'cliente' | 'sprint' | 'task', item: Cliente | Sprint | Task) => {
    if (type === 'cliente') {
      router.push('/clients');
    } else if (type === 'sprint') {
      router.push(`/sprint/${(item as Sprint).id}/tasks`);
    } else if (type === 'task') {
      const t = item as Task;
      router.push(`/sprint/${t.sprintId}/tasks/${t.id}`);
    }
    setResultsOpen(false);
  }, [router]);

  // calculate flattened index offset when rendering
  let flatCounter = 0;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }} className="w-full px-6">
      <input
        ref={inputRef}
        className="search-input w-full"
        placeholder="Buscar clientes, sprints ou tarefas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query && (filtered.clientes?.length || filtered.sprints?.length || filtered.tasks?.length)) setResultsOpen(true); }}
        aria-label="Buscar"
      />

      {resultsOpen && (
        <div className="search-dropdown">
          {/* Clients */}
          {filtered.clientes?.length > 0 && (
            <div className="search-section">
              <div className="text-xs muted">Clientes</div>
              {filtered.clientes.map((c: Cliente) => {
                const idxFlat = flatCounter++;
                const isActive = activeIndex === idxFlat;
                return (
                  <div
                    key={`c-${c.id}`}
                    className={"search-item" + (isActive ? ' active' : '')}
                    onClick={() => handleItemClick('cliente', c)}
                  >
                    <div className="title">{c.nome}</div>
                    <div className="meta">Cliente</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sprints */}
          {filtered.sprints?.length > 0 && (
            <div className="search-section">
              <div className="text-xs muted">Sprints</div>
              {filtered.sprints.map((s: Sprint) => {
                const idxFlat = flatCounter++;
                const isActive = activeIndex === idxFlat;
                return (
                  <div
                    key={`s-${s.id}`}
                    className={"search-item" + (isActive ? ' active' : '')}
                    onClick={() => handleItemClick('sprint', s)}
                  >
                    <div className="title">{s.name}</div>
                    <div className="meta">Sprint • {s.clienteId}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tasks */}
          {filtered.tasks?.length > 0 && (
            <div className="search-section">
              <div className="text-xs muted">Tarefas</div>
              {filtered.tasks.map((t: Task) => {
                const idxFlat = flatCounter++;
                const isActive = activeIndex === idxFlat;
                return (
                  <div
                    key={`t-${t.id}`}
                    className={"search-item" + (isActive ? ' active' : '')}
                    onClick={() => handleItemClick('task', t)}
                  >
                    <div className="title">{t.description || `Task ${t.id}`}</div>
                    <div className="meta">Tarefa • {t.sprintId}</div>
                  </div>
                );
              })}
            </div>
          )}

          {(!filtered.clientes?.length && !filtered.sprints?.length && !filtered.tasks?.length) && (
            <div className="search-section muted">Nenhum resultado encontrado</div>
          )}
        </div>
      )}
    </div>
  );
}
