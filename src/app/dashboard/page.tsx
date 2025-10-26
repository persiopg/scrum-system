"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BurndownChart } from '@/components/BurndownChart';
import { useScrum } from '@/context/ScrumContext';

export default function DashboardPage() {
  const { sprints, getTasksBySprint } = useScrum();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  const tasks = selectedSprint ? getTasksBySprint(selectedSprint.id) : [];

  const generateChartData = () => {
    if (!selectedSprint) return [];

    const start = new Date(selectedSprint.startDate);
    const end = new Date(selectedSprint.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const data = [];
    const totalTasks = selectedSprint.totalTasks;
    let actualRemaining = totalTasks;

    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayStr = date.toISOString().split('T')[0];

      const expectedRemaining = totalTasks - (totalTasks / (days - 1)) * i;

      // Subtract completed tasks up to this day
      const completedUpToDay = tasks.filter(task => 
        task.status === 'completed' && task.date && new Date(task.date) <= date
      ).length;
      actualRemaining = totalTasks - completedUpToDay;

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
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Dashboard Scrum</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Selecionar Sprint</label>
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="">Selecione um sprint</option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
            ))}
          </select>
          <Link href="/sprint" className="text-blue-500 hover:underline ml-4">Criar Novo Sprint</Link>
        </div>

        {selectedSprint && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Gráfico de Burndown</h2>
              {chartData.length > 0 ? (
                <BurndownChart data={chartData} />
              ) : (
                <p>Configure um sprint para ver o gráfico.</p>
              )}
            </div>

            <div className="mb-6">
              <Link href="/tasks" className="text-blue-500 hover:underline">Gerenciar Tarefas do Sprint</Link>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Resumo do Sprint</h2>
              <p>Total de Tarefas: {selectedSprint.totalTasks}</p>
              <p>Tarefas Concluídas: {tasks.filter(t => t.status === 'completed').length}</p>
              <p>Tarefas em Andamento: {tasks.filter(t => t.status === 'in-progress').length}</p>
              <p>Tarefas Pendentes: {tasks.filter(t => t.status === 'pending').length}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}