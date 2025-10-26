"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';

export default function CreateSprintPage() {
  const { clientes, addSprint, addTasks, setSprintAtiva } = useScrum();
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']); // Array de descrições de tarefas
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [ativarSprint, setAtivarSprint] = useState(false);

  const selectedCliente = selectedClienteId ? clientes.find(c => c.id === selectedClienteId) : null;

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

    // Criar nova sprint
    const sprint = addSprint({ clienteId: selectedCliente.id, name, startDate, endDate, totalTasks: tasks.filter(t => t.trim()).length, isActive: ativarSprint });
    
    // Adicionar tarefas ao sprint em lote
    const tasksToAdd = tasks
      .filter(description => description.trim())
      .map(description => ({ sprintId: sprint.id, description, status: 'pending' as const }));
    
    if (tasksToAdd.length > 0) {
      addTasks(tasksToAdd);
    }

    // Se ativar sprint, definir como ativa no cliente
    if (ativarSprint) {
      setSprintAtiva(selectedCliente.id, sprint.id);
    }

    router.push('/sprint');
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Criar Nova Sprint</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
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
    </div>
  );
}