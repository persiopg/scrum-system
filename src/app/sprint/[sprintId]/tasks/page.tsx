"use client";

import { useScrum } from '@/context/ScrumContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function SprintTasksPage() {
  const { sprints, getTasksBySprint, deleteTask } = useScrum();
  const router = useRouter();
  const params = useParams();
  const sprintId = params.sprintId as string;

  const sprint = sprints.find(s => s.id === sprintId);
  const tasks = getTasksBySprint(sprintId);

  if (!sprint) {
    return <div>Sprint não encontrada</div>;
  }

  // Editing is done on a separate page; handlers for inline edits removed.

  const handleDelete = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      deleteTask(taskId);
    }
  };

  const handleCreateNew = () => {
    router.push(`/sprint/${sprintId}/tasks/create`);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Atividades da Sprint</h1>
            <p className="text-gray-600">{sprint.name}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Criar Nova Atividade
            </button>
            <Link
              href="/sprint"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Atividades</h2>
          {tasks.length === 0 ? (
            <p>Nenhuma atividade cadastrada ainda.</p>
          ) : (
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data de Conclusão</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tempo Gasto</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Responsável</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{task.description}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.status}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.date || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.timeSpent ? `${task.timeSpent}h` : '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">{task.assignee || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => router.push(`/sprint/${sprintId}/tasks/${task.id}`)}
                        className="bg-purple-600 text-white px-2 py-1 rounded text-sm hover:bg-purple-800 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}