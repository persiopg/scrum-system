"use client";

import { useScrum } from '@/context/ScrumContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import SwitchToggle from '@/components/SwitchToggle';

export default function SprintPage() {
  const { sprints, getClienteById, deleteSprint, updateSprint, clientes, toggleSprintActive, selectedClienteId, getSprintsByCliente } = useScrum();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSprintId = searchParams.get('editSprintId');

  const editingSprint = editSprintId ? sprints.find(s => s.id === editSprintId) : null;

  // Filtrar sprints pelo cliente selecionado
  const filteredSprints = selectedClienteId ? getSprintsByCliente(selectedClienteId) : sprints;

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
            <h2 className="text-xl font-semibold mb-4">
              {selectedClienteId ? 'Sprints do Cliente Selecionado' : 'Todas as Sprints'}
            </h2>
            {!selectedClienteId && (
              <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  💡 <strong>Dica:</strong> Selecione um cliente no menu lateral para ver apenas as sprints específicas desse cliente.
                </p>
              </div>
            )}
            {filteredSprints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {selectedClienteId 
                    ? 'Nenhuma sprint encontrada para o cliente selecionado.' 
                    : 'Nenhuma sprint cadastrada ainda.'
                  }
                </p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {filteredSprints.map((sprint) => {
                const cliente = getClienteById(sprint.clienteId);
                return (
                  <li key={sprint.id} className="py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <div className="grow flex items-center gap-4 min-w-0">
                      <div className="text-sm text-gray-500 w-20">{sprint.startDate}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{sprint.name}</p>
                        <div className="mt-1">
                          {/* Show descriptive status */}
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            sprint.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                            sprint.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            sprint.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sprint.status === 'in-progress' ? 'Em Progresso' :
                             sprint.status === 'completed' ? 'Concluída' :
                             sprint.status === 'cancelled' ? 'Cancelada' :
                             'Planejada'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4 ml-4">
                      <p className="text-sm text-gray-500">{cliente?.nome || 'Desconhecido'}</p>
                      <p className="text-sm text-gray-500">{sprint.endDate}</p>
                      <SwitchToggle
                        isActive={sprint.isActive}
                        onToggle={() => toggleSprintActive(sprint.id)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(sprint.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Editar</button>
                        <button onClick={() => handleDelete(sprint.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Excluir</button>
                        <button onClick={() => router.push(`/sprint/${sprint.id}/tasks`)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Ver Atividades</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}