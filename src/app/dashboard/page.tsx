"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BurndownChart } from '@/components/BurndownChart';
import { useScrum } from '@/context/ScrumContext';

export default function DashboardPage() {
  const { clientes, getClienteById, getSprintsByCliente, getTasksBySprint, exportData, importData } = useScrum();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get('clienteId');
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clienteId || '');

  const selectedCliente = selectedClienteId ? getClienteById(selectedClienteId) : null;
  const sprintsCliente = selectedClienteId ? getSprintsByCliente(selectedClienteId) : [];
  const sprintAtiva = selectedCliente?.sprintAtiva ? sprintsCliente.find(s => s.id === selectedCliente.sprintAtiva && s.isActive) : null;
  const tasks = sprintAtiva ? getTasksBySprint(sprintAtiva.id) : [];

  const generateChartData = () => {
    if (!sprintAtiva) {
      console.log('No sprintAtiva');
      return [];
    }

    const start = new Date(sprintAtiva.startDate);
    const end = new Date(sprintAtiva.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    console.log('Dates:', { start: start.toISOString(), end: end.toISOString(), days });

    if (days <= 0) {
      console.log('Invalid days');
      return [];
    }

    const data = [];
    const totalTasks = tasks.length;
    let actualRemaining = totalTasks;

    console.log('Generating chart data:', { sprintAtiva, tasks, totalTasks, days });

    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayStr = date.toISOString().split('T')[0];

      const expectedRemaining = totalTasks - (totalTasks / Math.max(1, days - 1)) * i;

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

    console.log('Chart data:', data);
    return data;
  };

  const chartData = generateChartData();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scrum-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          importData(data);
          alert('Dados importados com sucesso!');
        } catch (error) {
          console.error(error);
          alert('Erro ao importar dados.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Dashboard Scrum</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Backup e Restauração</h2>
          <button
            onClick={handleExport}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-500 mr-4"
          >
            Exportar Dados (JSON)
          </button>
          <label className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800 cursor-pointer">
            Importar Dados (JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Selecionar Cliente</label>
          <select
            value={selectedClienteId}
            onChange={(e) => setSelectedClienteId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
          >
            <option value="">Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
            ))}
          </select>
          <Link href="/clients" className="text-purple-600 hover:underline">Gerenciar Clientes</Link>
        </div>

        {selectedCliente && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Cliente: {selectedCliente.nome}</h2>
              {sprintAtiva ? (
                <p>Sprint Ativa: {sprintAtiva.name}</p>
              ) : (
                <p>Nenhuma sprint ativa. <Link href={`/sprint?clienteId=${selectedCliente.id}`} className="text-purple-600 hover:underline">Criar uma sprint</Link></p>
              )}
            </div>

            {sprintAtiva && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Gráfico de Burndown</h2>
                  {chartData.length > 0 ? (
                    <BurndownChart data={chartData} />
                  ) : (
                    <div>
                      <p>Configure um sprint com tarefas para ver o gráfico.</p>
                      <p>Debug: sprintAtiva={!!sprintAtiva}, tasks={tasks.length}, chartData={chartData.length}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <Link href={`/tasks?clienteId=${selectedCliente.id}`} className="text-purple-600 hover:underline">Gerenciar Tarefas da Sprint Ativa</Link>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Resumo da Sprint Ativa</h2>
                  <p>Total de Tarefas: {tasks.length}</p>
                  <p>Tarefas Concluídas: {tasks.filter(t => t.status === 'completed').length}</p>
                  <p>Tarefas em Andamento: {tasks.filter(t => t.status === 'in-progress').length}</p>
                  <p>Tarefas Pendentes: {tasks.filter(t => t.status === 'pending').length}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}