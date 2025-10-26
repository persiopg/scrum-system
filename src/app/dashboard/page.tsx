"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BurndownChart } from '@/components/BurndownChart';
import { useScrum } from '@/context/ScrumContext';

function DashboardContent() {
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

    if (!tasks || tasks.length === 0) {
      console.log('No tasks available');
      return [];
    }

    try {
      const start = new Date(sprintAtiva.startDate);
      const end = new Date(sprintAtiva.endDate);

      // Validação das datas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log('Invalid dates:', { startDate: sprintAtiva.startDate, endDate: sprintAtiva.endDate });
        return [];
      }

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      console.log('Dates:', {
        start: start.toISOString(),
        end: end.toISOString(),
        days,
        startDate: sprintAtiva.startDate,
        endDate: sprintAtiva.endDate
      });

      if (days <= 0 || days > 365) {
        console.log('Invalid days range:', days);
        return [];
      }

      const data = [];
      const totalTasks = tasks.length;

      console.log('Generating chart data:', { sprintAtiva, tasksCount: tasks.length, totalTasks, days });

      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dayStr = date.toISOString().split('T')[0];

        // Cálculo da linha ideal (expectativa) - decrescente para burndown
        const progressRatio = i / Math.max(1, days - 1);
        const expectedRemaining = totalTasks * (1 - progressRatio);

        // Cálculo das tarefas concluídas até esta data
        // Suporta campos 'date' ou 'completedDate' para marcar conclusão
        const completedUpToDay = tasks.filter(task => {
          if (task.status !== 'completed') return false;
          const t = task as unknown as Record<string, unknown>;
          const dateStr = typeof t.completedDate === 'string'
            ? t.completedDate
            : typeof t.date === 'string'
              ? t.date
              : typeof t.completed_at === 'string'
                ? t.completed_at
                : undefined;
          if (!dateStr) return false;
          const taskDate = new Date(dateStr);
          if (isNaN(taskDate.getTime())) return false;
          return taskDate <= date;
        }).length;

        // Aqui armazenamos o restante real (total - concluídas até o dia)
        const actualRemaining = Math.max(0, totalTasks - completedUpToDay);

        data.push({
          day: dayStr,
          expected: Math.max(0, Math.round(expectedRemaining * 100) / 100),
          actual: actualRemaining,
        });
      }

      console.log('Generated chart data:', data);
      return data;
    } catch (error) {
      console.error('Error generating chart data:', error);
      return [];
    }
  };  const chartData = generateChartData();

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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
         
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Backup e Restauração</h2>
            <div className="flex gap-3">
              <button onClick={handleExport} style={{background: 'linear-gradient(90deg, #ec4899 0%, #fb923c 100%)'}} className="px-4 py-2 rounded text-white">Exportar Dados (JSON)</button>
              <label className="px-4 py-2 rounded bg-[rgba(255,255,255,0.03)] cursor-pointer">
                Importar Dados (JSON)
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Selecionar Cliente</label>
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded px-3 py-2 mb-4"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
            <Link href="/clients" className="text-blue-300 hover:underline">Gerenciar Clientes</Link>
          </div>

          {selectedCliente && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Cliente: {selectedCliente.nome}</h2>
                {sprintAtiva ? (
                  <p>Sprint Ativa: {sprintAtiva.name}</p>
                ) : (
                  <p>Nenhuma sprint ativa. <Link href={`/sprint?clienteId=${selectedCliente.id}`} className="text-blue-300 hover:underline">Criar uma sprint</Link></p>
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
                        <p className="muted">Debug: sprintAtiva={!!sprintAtiva}, tasks={tasks.length}, chartData={chartData.length}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <Link href={`/sprint/${sprintAtiva.id}/tasks`} className="text-blue-300 hover:underline">Gerenciar Tarefas da Sprint Ativa</Link>
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md"><p>Carregando...</p></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}