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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Atividades da Sprint</h2>
            <p className="text-gray-600">{sprint.name}</p>
            <div className="flex gap-3 mt-4">
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

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Atividades</h2>
            {tasks.length === 0 ? (
              <p>Nenhuma atividade cadastrada ainda.</p>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <li key={task.id} className="py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <div className="grow flex items-center gap-4 min-w-0">
                      <div className="text-sm text-gray-500 w-20">{task.date || 'N/A'}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{task.description}</p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? 'Concluída' :
                             task.status === 'in-progress' ? 'Em Andamento' :
                             'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4 ml-4">
                      <p className="text-sm text-gray-500">{task.assignee || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{task.timeSpent ? `${task.timeSpent}h` : 'N/A'}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/sprint/${sprintId}/tasks/${task.id}`)}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}