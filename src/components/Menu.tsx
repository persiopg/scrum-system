"use client";

import Link from 'next/link';

export function Menu() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-4xl mx-auto flex space-x-4">
        <Link href="/" className="hover:underline">Burndown Chart</Link>
        <Link href="/tasks" className="hover:underline">Atividades do Sprint</Link>
      </div>
    </nav>
  );
}