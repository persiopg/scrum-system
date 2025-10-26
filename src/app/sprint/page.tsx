"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SprintPage() {
  const { clientes, getClienteById, addSprintToCliente, addTasks, setSprintAtiva } = useScrum();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get('clienteId');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']); // Array de descrições de tarefas
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clienteId || '');
  const [ativarSprint, setAtivarSprint] = useState(false);

  const selectedCliente = selectedClienteId ? getClienteById(selectedClienteId) : null;

  const addTaskField = () => {
    setTasks([...tasks, '']);
  };

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;

    const sprint = addSprintToCliente(selectedCliente.id, { name, startDate, endDate, totalTasks: tasks.filter(t => t.trim()).length });
    
    // Adicionar tarefas ao sprint em lote
    const tasksToAdd = tasks
      .filter(description => description.trim())
      .map(description => ({ sprintId: sprint.id, description, status: 'pending' as const }));
    
    if (tasksToAdd.length > 0) {
      addTasks(tasksToAdd);
    }

    if (ativarSprint) {
      setSprintAtiva(selectedCliente.id, sprint.id);
    }

    router.push(`/dashboard?clienteId=${selectedCliente.id}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Sprint</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Selecionar Cliente</label>
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
          </div>

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
            <label className="block text-sm font-medium mb-2">Atividades do Sprint</label>
            {tasks.map((task, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder="Descrição da atividade"
                  value={task}
                  onChange={(e) => updateTask(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2"
                />
                <button
                  type="button"
                  onClick={() => removeTask(index)}
                  className="bg-purple-900 text-white px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTaskField}
              className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-900"
            >
              Adicionar Atividade
            </button>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={ativarSprint}
                onChange={(e) => setAtivarSprint(e.target.checked)}
                className="mr-2"
              />
              Ativar esta sprint após criar
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            disabled={!selectedCliente}
          >
            Criar Sprint
          </button>
        </form>
      </div>
    </div>
  );
}