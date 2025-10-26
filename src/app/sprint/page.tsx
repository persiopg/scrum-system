"use client";

import { useState, useEffect } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface EditingSprint {
  id: string;
  clienteId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function SprintPage() {
  const { clientes, sprints, getClienteById, addSprint, updateSprint, moveSprintToCliente, deleteSprint, addTasks, setSprintAtiva, getTasksBySprint } = useScrum();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get('clienteId');
  const editSprintId = searchParams.get('editSprintId');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']); // Array de descrições de tarefas
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clienteId || '');
  const [ativarSprint, setAtivarSprint] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSprint, setEditingSprint] = useState<EditingSprint | null>(null);

  // Carregar dados para edição se editSprintId estiver presente
  useEffect(() => {
    if (editSprintId) {
      const sprint = sprints.find(s => s.id === editSprintId);
      if (sprint) {
        setIsEditing(true);
        setEditingSprint(sprint);
        setName(sprint.name);
        setStartDate(sprint.startDate);
        setEndDate(sprint.endDate);
        setSelectedClienteId(sprint.clienteId);
        setAtivarSprint(sprint.isActive);
        // Carregar tarefas
        const sprintTasks = getTasksBySprint(sprint.id);
        setTasks(sprintTasks.map(t => t.description));
      }
    }
  }, [editSprintId, sprints, getTasksBySprint]);

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

    if (isEditing && editingSprint) {
      // Atualizar sprint
      updateSprint(editingSprint.id, { name, startDate, endDate });
      // Se cliente mudou, mover
      if (selectedClienteId !== editingSprint.clienteId) {
        moveSprintToCliente(editingSprint.id, selectedClienteId);
      }
      // Atualizar tarefas (simplificado, não implementado)
    } else {
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
    }

    router.push(`/dashboard?clienteId=${selectedCliente.id}`);
  };

  const handleEdit = (sprintId: string) => {
    router.push(`/sprint?editSprintId=${sprintId}`);
  };

  const handleDelete = (sprintId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sprint?')) {
      deleteSprint(sprintId);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Sprint' : 'Gerenciar Sprints'}</h1>
        
        {!isEditing && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Sprints Existentes</h2>
            {sprints.map(sprint => {
              const cliente = getClienteById(sprint.clienteId);
              return (
                <div key={sprint.id} className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{sprint.name}</h3>
                    <p>Cliente: {cliente?.nome || 'Desconhecido'}</p>
                    <p>{sprint.startDate} - {sprint.endDate}</p>
                    <p>Status: {sprint.isActive ? 'Ativa' : 'Inativa'}</p>
                  </div>
                  <div>
                    <button onClick={() => handleEdit(sprint.id)} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Editar</button>
                    <button onClick={() => handleDelete(sprint.id)} className="bg-red-600 text-white px-4 py-2 rounded">Excluir</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Editar Sprint' : 'Criar Novo Sprint'}</h2>
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

            {!isEditing && (
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
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ativarSprint}
                  onChange={(e) => setAtivarSprint(e.target.checked)}
                  className="mr-2"
                />
                {isEditing ? 'Marcar como ativa' : 'Ativar esta sprint após criar'}
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
              disabled={!selectedCliente}
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Sprint'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditingSprint(null); setName(''); setStartDate(''); setEndDate(''); setTasks(['']); setSelectedClienteId(clienteId || ''); setAtivarSprint(false); }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 mt-2"
              >
                Cancelar Edição
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}