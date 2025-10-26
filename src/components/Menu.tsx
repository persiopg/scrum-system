"use client";

import Link from 'next/link';

export function Menu() {
  return (
    <nav className="bg-purple-600 text-white p-4">
      <div className="max-w-4xl mx-auto flex space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/clients">Clientes</Link>
        <Link href="/sprint">Sprints</Link>
        <Link href="/tasks">Atividades</Link>
      </div>
    </nav>
  );
}