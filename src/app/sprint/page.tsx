"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';

export default function SprintPage() {
  const { addSprint } = useScrum();
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalTasks, setTotalTasks] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSprint({ name, startDate, endDate, totalTasks });
    router.push('/dashboard');
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Sprint</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Sprint</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total de Tarefas</label>
            <input
              type="number"
              value={totalTasks}
              onChange={(e) => setTotalTasks(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Criar Sprint
          </button>
        </form>
      </div>
    </div>
  );
}