"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { BurndownChart } from '@/components/BurndownChart';
import { TaskStatusChart } from '@/components/TaskStatusChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useScrum } from '@/context/ScrumContext';

function DashboardContent() {
  const { getClienteById, getSprintsByCliente, getTasksBySprint, exportData, importData, selectedClienteId } = useScrum();
  const [report, setReport] = useState<string | null>(null);

  const selectedCliente = selectedClienteId ? getClienteById(selectedClienteId) : null;
  const sprintsCliente = selectedClienteId ? getSprintsByCliente(selectedClienteId) : [];
  const sprintAtiva = selectedCliente?.sprintAtiva ? sprintsCliente.find(s => s.id === selectedCliente.sprintAtiva && s.isActive) : null;
  const tasks = sprintAtiva ? getTasksBySprint(sprintAtiva.id) : [];

  const calculateTeamVelocity = () => {
    if (!selectedClienteId) return 0;
    const allSprints = getSprintsByCliente(selectedClienteId);
    const completedSprints = allSprints.filter(s => !s.isActive && new Date(s.endDate) < new Date());
    if (completedSprints.length === 0) return 0;
    const totalCompletedTasks = completedSprints.reduce((sum, sprint) => {
      const sprintTasks = getTasksBySprint(sprint.id);
      return sum + sprintTasks.filter(t => t.status === 'completed').length;
    }, 0);
    return Math.round(totalCompletedTasks / completedSprints.length);
  };

  const calculateVelocityChartData = () => {
    if (!selectedClienteId) return [];
    const allSprints = getSprintsByCliente(selectedClienteId);
    const completedSprints = allSprints.filter(s => !s.isActive && new Date(s.endDate) < new Date());
    return completedSprints.map(sprint => {
      const sprintTasks = getTasksBySprint(sprint.id);
      const completedTasks = sprintTasks.filter(t => t.status === 'completed').length;
      return {
        name: sprint.name,
        velocity: completedTasks,
      };
    });
  };

  const teamVelocity = calculateTeamVelocity();
  const velocityChartData = calculateVelocityChartData();

  const calculatePerformanceMetrics = () => {
    if (!selectedClienteId) return { avgCompletionTime: 0, completionRate: 0 };
    const allSprints = getSprintsByCliente(selectedClienteId);
    const allTasks = allSprints.flatMap(sprint => getTasksBySprint(sprint.id));
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const completionRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

    // Calcular tempo médio de conclusão (dias)
    const tasksWithTime = completedTasks.filter(t => t.date);
    const avgCompletionTime = tasksWithTime.length > 0
      ? tasksWithTime.reduce((sum, t) => {
          const sprint = allSprints.find(s => s.id === t.sprintId);
          if (!sprint) return sum;
          const start = new Date(sprint.startDate);
          const end = new Date(t.date!);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / tasksWithTime.length
      : 0;

    return { avgCompletionTime: Math.round(avgCompletionTime * 10) / 10, completionRate: Math.round(completionRate * 10) / 10 };
  };

  const calculatePerformanceChartData = () => {
    if (!selectedClienteId) return [];
    const allSprints = getSprintsByCliente(selectedClienteId);
    const completedSprints = allSprints.filter(s => !s.isActive && new Date(s.endDate) < new Date());
    return completedSprints.map(sprint => {
      const sprintTasks = getTasksBySprint(sprint.id);
      const completedTasks = sprintTasks.filter(t => t.status === 'completed' && t.date);
      const avgTime = completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => {
            const start = new Date(sprint.startDate);
            const end = new Date(t.date!);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / completedTasks.length
        : 0;
      return {
        name: sprint.name,
        avgTime: Math.round(avgTime * 10) / 10,
      };
    });
  };

  const { avgCompletionTime, completionRate } = calculatePerformanceMetrics();
  const performanceChartData = calculatePerformanceChartData();

  const getAlerts = () => {
    const alerts = [];
    if (sprintAtiva) {
      const endDate = new Date(sprintAtiva.endDate);
      const today = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft > 0) {
        alerts.push(`Sprint ativa termina em ${daysLeft} dias.`);
      } else if (daysLeft < 0) {
        alerts.push('Sprint ativa já terminou!');
      }
    }
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.date && new Date(t.date) < new Date());
    if (overdueTasks.length > 0) {
      alerts.push(`${overdueTasks.length} tarefa(s) atrasada(s).`);
    }
    return alerts;
  };

  const alerts = getAlerts();

  const handleGenerateReport = async () => {
    if (!selectedClienteId) {
      alert('Selecione um cliente primeiro.');
      return;
    }

    const cliente = getClienteById(selectedClienteId);
    const sprints = getSprintsByCliente(selectedClienteId);
    const tasks = sprints.flatMap(sprint => getTasksBySprint(sprint.id));
    const metrics = {
      teamVelocity,
      avgCompletionTime,
      completionRate,
    };

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { cliente, sprints, tasks, metrics } }),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        alert('Erro ao gerar relatório.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar relatório.');
    }
  };

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
      <div className="mx-auto"> 
 
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

          {alerts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">Alertas</h2>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded">
                    <p className="text-yellow-200">{alert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client is selected via the sidebar menu; removed duplicate selector from dashboard */}
          {!selectedClienteId && (
            <div className="mb-6">
              <p className="muted">Nenhum cliente selecionado. Use o seletor no menu lateral para escolher um cliente.</p>
              <Link href="/clients" className="text-blue-300 hover:underline">Gerenciar Clientes</Link>
            </div>
          )}

          {selectedCliente && (
            <>
              <div className="mb-6"> 
                {sprintAtiva ? "": (
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
                    <TaskStatusChart tasks={tasks} />
                    <div className="mt-4 text-sm text-gray-400">
                      <p>Total de Tarefas: {tasks.length}</p>
                      <p>Tarefas Concluídas: {tasks.filter(t => t.status === 'completed').length}</p>
                      <p>Tarefas em Andamento: {tasks.filter(t => t.status === 'in-progress').length}</p>
                      <p>Tarefas Pendentes: {tasks.filter(t => t.status === 'pending').length}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Velocidade da Equipe</h2>
                    <div className="text-sm text-gray-400 mb-4">
                      <p>Velocidade Média: {teamVelocity} tarefas por sprint</p>
                      {teamVelocity === 0 && <p className="text-yellow-400">Nenhuma sprint completada ainda para calcular velocidade.</p>}
                    </div>
                    {velocityChartData.length > 0 && (
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={velocityChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="velocity" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Métricas de Performance</h2>
                    <div className="text-sm text-gray-400 mb-4 space-y-1">
                      <p>Tempo Médio de Conclusão: {avgCompletionTime} dias</p>
                      <p>Taxa de Conclusão Geral: {completionRate}%</p>
                    </div>
                    {performanceChartData.length > 0 && (
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="avgTime" stroke="#8884d8" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Nova seção para relatório com IA */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Relatório com IA</h2>
            <button
              onClick={handleGenerateReport}
              style={{background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'}}
              className="px-4 py-2 rounded text-white mb-4"
            >
              Gerar Relatório com IA
            </button>
            {report && (
              <div className="p-4 bg-gray-800 rounded">
                <pre className="whitespace-pre-wrap text-gray-200">{report}</pre>
              </div>
            )}
          </div>
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