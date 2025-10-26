"use client";

import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';

export default function SprintPage() {
  const { sprints, getClienteById, deleteSprint } = useScrum();
  const router = useRouter();

  const handleEdit = (sprintId: string) => {
    router.push(`/sprint?editSprintId=${sprintId}`);
  };

  const handleDelete = (sprintId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sprint?')) {
      deleteSprint(sprintId);
    }
  };

  const handleCreateNew = () => {
    router.push('/sprint/create');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Sprints</h1>
          <button
            onClick={handleCreateNew}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
          >
            Criar Nova Sprint
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
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
                    <td className="border border-gray-300 px-4 py-2">{sprint.isActive ? 'Ativa' : 'Inativa'}</td>
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
  );
}