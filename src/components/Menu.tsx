"use client";

import Link from 'next/link';

export function Menu() {
  return (
    <nav className="bg-purple-600 text-white p-4">
      <div className="max-w-4xl mx-auto flex space-x-4"> 
        <Link href="/dashboard" className="hover:text-purple-200 transition-colors">Dashboard</Link>
        <Link href="/clients" className="hover:text-purple-200 transition-colors">Clientes</Link>
        <Link href="/sprint" className="hover:text-purple-200 transition-colors">Sprints</Link>
      </div>
    </nav>
  );
}