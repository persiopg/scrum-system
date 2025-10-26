"use client";

import { useScrum } from '@/context/ScrumContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import SwitchToggle from '@/components/SwitchToggle';

export default function SprintPage() {
  const { sprints, getClienteById, deleteSprint, updateSprint, clientes, toggleSprintActive } = useScrum();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSprintId = searchParams.get('editSprintId');

  const editingSprint = editSprintId ? sprints.find(s => s.id === editSprintId) : null;

  const [editName, setEditName] = useState(editingSprint?.name || '');
  const [editStartDate, setEditStartDate] = useState(editingSprint?.startDate || '');
  const [editEndDate, setEditEndDate] = useState(editingSprint?.endDate || '');
  const [editClienteId, setEditClienteId] = useState(editingSprint?.clienteId || '');

  const handleEdit = (sprintId: string) => {
    router.push(`/sprint?editSprintId=${sprintId}`);
  };

  const handleSaveEdit = () => {
    if (editingSprint) {
      updateSprint(editingSprint.id, {
        name: editName,
        startDate: editStartDate,
        endDate: editEndDate,
        clienteId: editClienteId,
      });
      router.push('/sprint');
    }
  };

  const handleCancelEdit = () => {
    router.push('/sprint');
  };

  const handleDelete = (sprintId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sprint?')) {
      deleteSprint(sprintId);
    }
  };

  const handleCreateNew = () => {
    router.push('/sprint/create');
  };

  if (editingSprint) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Editar Sprint</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <select
                  value={editClienteId}
                  onChange={(e) => setEditClienteId(e.target.value)}
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Início</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Fim</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciar Sprints</h2>
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Criar Nova Sprint
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Todas as Sprints</h2>
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data de Início</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data de Fim</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sprints.map(sprint => {
                  const cliente = getClienteById(sprint.clienteId);
                  return (
                    <tr key={sprint.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{sprint.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{cliente?.nome || 'Desconhecido'}</td>
                      <td className="border border-gray-300 px-4 py-2">{sprint.startDate}</td>
                      <td className="border border-gray-300 px-4 py-2">{sprint.endDate}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <SwitchToggle
                          isActive={sprint.isActive}
                          onToggle={() => toggleSprintActive(sprint.id)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button onClick={() => handleEdit(sprint.id)} className="bg-blue-600 text-white px-2 py-1 rounded mr-2 text-sm">Editar</button>
                        <button onClick={() => handleDelete(sprint.id)} className="bg-red-600 text-white px-2 py-1 rounded mr-2 text-sm">Excluir</button>
                        <button onClick={() => router.push(`/sprint/${sprint.id}/tasks`)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Ver Atividades</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}