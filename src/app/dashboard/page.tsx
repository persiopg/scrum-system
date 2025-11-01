"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { BurndownChart } from '@/components/BurndownChart';
import { TaskStatusChart } from '@/components/TaskStatusChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useScrum } from '@/context/ScrumContext';
import type { Sprint } from '@/context/ScrumContext';

function DashboardContent() {
  const { getClienteById, getSprintsByCliente, getTasksBySprint, exportData, importData, selectedClienteId, sprints: allSprints, clientes } = useScrum();
  const [report, setReport] = useState<string | null>(null);

  const selectedCliente = selectedClienteId ? getClienteById(selectedClienteId) : null;
  const sprintsCliente = selectedClienteId ? getSprintsByCliente(selectedClienteId) : [];
  const sprintAtiva = selectedCliente?.sprintAtiva ? sprintsCliente.find(s => s.id === selectedCliente.sprintAtiva && s.isActive) : null;
  const tasks = sprintAtiva ? getTasksBySprint(sprintAtiva.id) : [];

  const [reportPreferences, setReportPreferences] = useState<Record<string, { base: string; comparisons: string[] }>>({});

  const currentPreferences = selectedClienteId ? reportPreferences[selectedClienteId] : undefined;
  const defaultBaseSprintId = selectedClienteId ? (sprintAtiva?.id ?? sprintsCliente[0]?.id ?? 'all') : 'all';
  const baseSprintSelection = currentPreferences?.base && (currentPreferences.base === 'all' || sprintsCliente.some(s => s.id === currentPreferences.base))
    ? currentPreferences.base
    : defaultBaseSprintId;
  const comparisonSprintSelection = currentPreferences?.comparisons
    ?.filter(id => id !== baseSprintSelection && sprintsCliente.some(s => s.id === id)) ?? [];

  const handleBaseSprintSelect = (value: string) => {
    if (!selectedClienteId) return;
    const sanitizedBase = value === 'all' || sprintsCliente.some(s => s.id === value) ? value : defaultBaseSprintId;
    setReportPreferences(prev => {
      const prevForClient = prev[selectedClienteId] ?? { base: baseSprintSelection, comparisons: [] };
      const filteredComparisons = sanitizedBase === 'all'
        ? []
        : prevForClient.comparisons.filter(id => id !== sanitizedBase && sprintsCliente.some(s => s.id === id));
      return {
        ...prev,
        [selectedClienteId]: {
          base: sanitizedBase,
          comparisons: filteredComparisons,
        },
      };
    });
  };

  const toggleComparisonSprint = (sprintId: string) => {
    if (!selectedClienteId) return;
    if (!sprintsCliente.some(s => s.id === sprintId)) return;
    const effectiveBase = baseSprintSelection;
    if (effectiveBase === 'all') return;
    if (sprintId === effectiveBase) return;

    setReportPreferences(prev => {
      const prevForClient = prev[selectedClienteId] ?? { base: effectiveBase, comparisons: [] };
      const alreadySelected = prevForClient.comparisons.includes(sprintId);
      const sanitizedComparisons = prevForClient.comparisons.filter(id => id !== effectiveBase && sprintsCliente.some(s => s.id === id));
      const nextComparisons = alreadySelected
        ? sanitizedComparisons.filter(id => id !== sprintId)
        : [...sanitizedComparisons, sprintId];
      return {
        ...prev,
        [selectedClienteId]: {
          base: prevForClient.base ?? effectiveBase,
          comparisons: nextComparisons,
        },
      };
    });
  };

  const activeSprintsData = !selectedClienteId
    ? allSprints
        .filter(s => s.isActive)
        .map(sprint => {
          const sprintTasks = getTasksBySprint(sprint.id);
          const completedTasks = sprintTasks.filter(t => t.status === 'completed').length;
          const cliente = getClienteById(sprint.clienteId);
          return {
            name: `${cliente?.nome?.split(' ')[0] ?? 'Cliente'} - ${sprint.name}`,
            total: sprint.totalTasks || sprintTasks.length,
            concluidas: completedTasks,
            pendentes: (sprint.totalTasks || sprintTasks.length) - completedTasks,
          };
        })
    : [];

  const calculateTeamVelocity = (clienteId?: string | null, sprintsOverride?: Sprint[]) => {
    const targetSprints = sprintsOverride ?? (clienteId ? getSprintsByCliente(clienteId) : allSprints);
    if (!targetSprints || targetSprints.length === 0) return 0;
    const completedSprints = targetSprints.filter(s => !s.isActive && !!s.endDate && new Date(s.endDate) < new Date());
    if (completedSprints.length === 0) return 0;
    const totalCompletedTasks = completedSprints.reduce((sum, sprint) => {
      const sprintTasks = getTasksBySprint(sprint.id);
      return sum + sprintTasks.filter(t => t.status === 'completed').length;
    }, 0);
    return Math.round(totalCompletedTasks / completedSprints.length);
  };

  const calculateVelocityChartData = (clienteId?: string | null) => {
    if (!clienteId) return [];
    const clienteSprints = getSprintsByCliente(clienteId);
    const completedSprints = clienteSprints.filter(s => !s.isActive && !!s.endDate && new Date(s.endDate) < new Date());
    return completedSprints.map(sprint => {
      const sprintTasks = getTasksBySprint(sprint.id);
      const completedTasks = sprintTasks.filter(t => t.status === 'completed').length;
      return {
        name: sprint.name,
        velocity: completedTasks,
      };
    });
  };

  const teamVelocity = calculateTeamVelocity(selectedClienteId);
  const velocityChartData = calculateVelocityChartData(selectedClienteId);

  const calculatePerformanceMetrics = (clienteId?: string | null, sprintsOverride?: Sprint[]) => {
    const targetSprints = sprintsOverride ?? (clienteId ? getSprintsByCliente(clienteId) : allSprints);
    if (!targetSprints || targetSprints.length === 0) {
      return { avgCompletionTime: 0, completionRate: 0 };
    }
    const tasksForScope = targetSprints.flatMap(sprint => getTasksBySprint(sprint.id));
    if (tasksForScope.length === 0) {
      return { avgCompletionTime: 0, completionRate: 0 };
    }
    const completedTasks = tasksForScope.filter(t => t.status === 'completed');
    const completionRate = tasksForScope.length > 0 ? (completedTasks.length / tasksForScope.length) * 100 : 0;

    const tasksWithTime = completedTasks.filter(t => t.date);
    const avgCompletionTime = tasksWithTime.length > 0
      ? tasksWithTime.reduce((sum, t) => {
          const sprint = targetSprints.find(s => s.id === t.sprintId);
          if (!sprint) return sum;
          const start = new Date(sprint.startDate);
          const end = new Date(t.date!);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return sum;
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / tasksWithTime.length
      : 0;

    return {
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
    };
  };

  const calculatePerformanceChartData = (clienteId?: string | null) => {
    if (!clienteId) return [];
    const clienteSprints = getSprintsByCliente(clienteId);
    const completedSprints = clienteSprints.filter(s => !s.isActive && !!s.endDate && new Date(s.endDate) < new Date());
    return completedSprints.map(sprint => {
      const sprintTasks = getTasksBySprint(sprint.id);
      const completedTasks = sprintTasks.filter(t => t.status === 'completed' && t.date);
      const avgTime = completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => {
            const start = new Date(sprint.startDate);
            const end = new Date(t.date!);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return sum;
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

  const { avgCompletionTime, completionRate } = calculatePerformanceMetrics(selectedClienteId);
  const performanceChartData = calculatePerformanceChartData(selectedClienteId);

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
    const summarizeSprint = (sprint: Sprint) => {
      const sprintTasks = getTasksBySprint(sprint.id);
      const completed = sprintTasks.filter(t => t.status === 'completed').length;
      const inProgress = sprintTasks.filter(t => t.status === 'in-progress').length;
      const pending = sprintTasks.filter(t => t.status === 'pending').length;
      const hours = Math.round(sprintTasks.reduce((sum, task) => sum + (task.timeSpent ?? 0), 0) * 10) / 10;

      return {
        id: sprint.id,
        clienteId: sprint.clienteId,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        isActive: sprint.isActive,
        totalTasks: sprintTasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        totalHoursSpent: hours,
      };
    };

    const compileMetrics = (scopeSprints: Sprint[], clienteId?: string | null) => {
      const sprintMetrics = calculatePerformanceMetrics(clienteId, scopeSprints);
      const velocity = calculateTeamVelocity(clienteId, scopeSprints);
      const tasksForScope = scopeSprints.flatMap(sprint => getTasksBySprint(sprint.id));
      const totalHoursSpent = Math.round(tasksForScope.reduce((sum, task) => sum + (task.timeSpent ?? 0), 0) * 10) / 10;

      return {
        metrics: {
          ...sprintMetrics,
          teamVelocity: velocity,
          totalHoursSpent,
        },
        tasks: tasksForScope,
      };
    };

    let payload: Record<string, unknown>;

    if (!selectedClienteId) {
      const scopeSprints = allSprints;
      const { metrics, tasks: globalTasks } = compileMetrics(scopeSprints);

      payload = {
        scope: 'global',
        clientes,
        sprints: scopeSprints.map(summarizeSprint),
        tasks: globalTasks,
        metrics,
        totals: {
          totalClientes: clientes.length,
          totalSprints: scopeSprints.length,
          totalTasks: globalTasks.length,
        },
      };
    } else {
      const cliente = getClienteById(selectedClienteId);
      if (!cliente) {
        alert('Cliente selecionado não encontrado.');
        return;
      }

      const baseSelection = baseSprintSelection;
      const comparisonSelections = baseSelection === 'all' ? [] : comparisonSprintSelection;

      let scopedSprints: Sprint[];
      if (baseSelection === 'all') {
        scopedSprints = sprintsCliente;
      } else {
        const baseSprint = sprintsCliente.find(s => s.id === baseSelection);
        const comparisonSprints = sprintsCliente.filter(s => comparisonSelections.includes(s.id));
        const uniqueEntries = new Map<string, Sprint>();
        if (baseSprint) uniqueEntries.set(baseSprint.id, baseSprint);
        comparisonSprints.forEach(s => uniqueEntries.set(s.id, s));
        scopedSprints = Array.from(uniqueEntries.values());
        if (scopedSprints.length === 0 && baseSprint) {
          scopedSprints = [baseSprint];
        }
        if (scopedSprints.length === 0) {
          scopedSprints = sprintsCliente;
        }
      }

      const { metrics, tasks: scopedTasks } = compileMetrics(scopedSprints, selectedClienteId);

      const baseSummary = baseSelection === 'all'
        ? null
        : (() => {
            const sprint = sprintsCliente.find(s => s.id === baseSelection);
            return sprint ? summarizeSprint(sprint) : null;
          })();

      const comparisonSummaries = comparisonSelections
        .map(id => {
          const sprint = sprintsCliente.find(s => s.id === id);
          return sprint ? summarizeSprint(sprint) : null;
        })
        .filter((summary): summary is ReturnType<typeof summarizeSprint> => summary !== null);

      payload = {
        scope: 'cliente',
        cliente,
        baseSprintId: baseSelection === 'all' ? null : baseSelection,
        baseSprintSummary: baseSummary,
        comparisonSprintIds: comparisonSelections,
        comparisonSummaries,
        sprints: scopedSprints.map(summarizeSprint),
        tasks: scopedTasks,
        metrics,
      };
    }

    try {
      setReport(null);
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
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
      return [];
    }

    if (!tasks || tasks.length === 0) {
      return [];
    }

    try {
      const start = new Date(sprintAtiva.startDate);
      const end = new Date(sprintAtiva.endDate);

      // Validação das datas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return [];
      }

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Dates debug removed

      if (days <= 0 || days > 365) {
        return [];
      }

      const data = [];
      const totalTasks = tasks.length;

  // Generation debug removed

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
            <div className="mb-6 text-center">
              <p className="muted mb-4">Para ver detalhes de uma sprint, selecione o cliente no menu lateral.</p>
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Comparativo de Sprints Ativas</h2>
                {activeSprintsData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={activeSprintsData}
                        margin={{
                          top: 20, right: 30, left: 20, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="concluidas" stackId="a" fill="#82ca9d" name="Concluídas" />
                        <Bar dataKey="pendentes" stackId="a" fill="#8884d8" name="Pendentes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p>Nenhuma sprint ativa no momento.</p>
                )}
              </div>
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
            {!selectedCliente && (
              <p className="muted mb-4 text-sm">Nenhum cliente selecionado. O relatório trará um panorama geral com todas as sprints, tarefas e horas registradas.</p>
            )}
            {selectedCliente && (
              <div className="mb-4 space-y-4 text-left">
                <div>
                  <label className="block text-sm font-semibold mb-2">Sprint base para o relatório</label>
                  <select
                    value={baseSprintSelection}
                    onChange={(event) => handleBaseSprintSelect(event.target.value)}
                    className="w-full rounded bg-[rgba(255,255,255,0.08)] px-3 py-2 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Todas as sprints do cliente</option>
                    {sprintsCliente.map(sprint => (
                      <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                    ))}
                  </select>
                  <p className="muted text-xs mt-2">Escolha a sprint principal que servirá de referência para o relatório.</p>
                </div>
                {sprintsCliente.length > 0 && baseSprintSelection !== 'all' ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Comparar com outras sprints deste cliente:</p>
                    <div className="flex flex-wrap gap-2">
                      {sprintsCliente.filter(sprint => sprint.id !== baseSprintSelection).map(sprint => {
                        const checked = comparisonSprintSelection.includes(sprint.id);
                        return (
                          <label key={sprint.id} className={`flex items-center gap-2 px-3 py-2 rounded border border-white/10 cursor-pointer transition ${checked ? 'bg-purple-600/40' : 'bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)]'}`}>
                            <input
                              type="checkbox"
                              className="accent-purple-500"
                              checked={checked}
                              onChange={() => toggleComparisonSprint(sprint.id)}
                            />
                            <span className="text-sm">{sprint.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {sprintsCliente.filter(s => s.id !== baseSprintSelection).length === 0 && (
                      <p className="muted text-xs mt-2">Não há outras sprints para comparar.</p>
                    )}
                  </div>
                ) : selectedCliente && sprintsCliente.length > 0 ? (
                  <p className="text-sm text-gray-400">Selecione uma sprint específica para habilitar comparações.</p>
                ) : null}
              </div>
            )}
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