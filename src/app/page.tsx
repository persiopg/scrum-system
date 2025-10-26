"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BurndownChart } from '@/components/BurndownChart';

interface Delivery {
  date: string;
  done: number;
}

export default function Home() {
  const [endDate, setEndDate] = useState('');
  const [totalTasks, setTotalTasks] = useState(0);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [newDone, setNewDone] = useState(0);

  const addDelivery = () => {
    const today = new Date().toISOString().split('T')[0];
    setDeliveries([...deliveries, { date: today, done: newDone }]);
    setNewDone(0);
  };

  const generateChartData = () => {
    if (!endDate || totalTasks === 0) return [];

    const start = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const data = [];
    let actualRemaining = totalTasks;

    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayStr = date.toISOString().split('T')[0];

      const expectedRemaining = totalTasks - (totalTasks / (days - 1)) * i;

      // Subtract done on this day
      const doneToday = deliveries.find(d => d.date === dayStr)?.done || 0;
      actualRemaining -= doneToday;

      data.push({
        day: dayStr,
        expected: Math.max(0, expectedRemaining),
        actual: Math.max(0, actualRemaining),
      });
    }

    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <Link href="/tasks" className="text-blue-500 hover:underline">Gerenciar Tarefas</Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">Sistema de Gestão Scrum</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Data Final</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Total de Atividades</label>
          <input
            type="number"
            value={totalTasks}
            onChange={(e) => setTotalTasks(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Atividades Feitas Hoje</label>
          <input
            type="number"
            value={newDone}
            onChange={(e) => setNewDone(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
          <button
            onClick={addDelivery}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Entrega
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Burndown</h2>
          {chartData.length > 0 ? (
            <BurndownChart data={chartData} />
          ) : (
            <p>Configure a data final e total de atividades para ver o gráfico.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Entregas Registradas</h2>
          <ul>
            {deliveries.map((d, i) => (
              <li key={i}>{d.date}: {d.done} atividades</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
