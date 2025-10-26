"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter, useParams } from 'next/navigation';

export default function EditTaskPage() {
  const { getTasksBySprint, updateTask, deleteTask, sprints, executores } = useScrum();
  const router = useRouter();
  const params = useParams();
  const sprintId = params.sprintId as string;
  const taskId = params.taskId as string;

  const sprint = sprints.find(s => s.id === sprintId);
  const tasks = getTasksBySprint(sprintId);
  const task = tasks.find(t => t.id === taskId);

  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>(task?.status ?? 'pending');
  const [assignee, setAssignee] = useState(task?.assignee ?? '');
  const [date, setDate] = useState(task?.date ?? '');
  const [timeSpent, setTimeSpent] = useState<number | ''>(task?.timeSpent ?? '');

  if (!sprint) return <div>Sprint não encontrada</div>;
  if (!task) return <div>Atividade não encontrada</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTask(taskId, {
      description,
      status,
      assignee: assignee || undefined,
      date: date || undefined,
      timeSpent: typeof timeSpent === 'number' ? timeSpent : undefined,
    });
    router.push(`/sprint/${sprintId}/tasks`);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      deleteTask(taskId);
      router.push(`/sprint/${sprintId}/tasks`);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Editar Atividade</h2>
            <p className="text-gray-600 mb-4">Sprint: {sprint.name}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="pending">Pendente</option>
                  <option value="in-progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Conclusão</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tempo Gasto (horas)</label>
                <input
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsável</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecione um responsável</option>
                  {executores.map((executor) => (
                    <option key={executor.id} value={executor.nome}>
                      {executor.nome} - {executor.cargo}
                    </option>
                  ))}
                </select>
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
                  onClick={() => router.push(`/sprint/${sprintId}/tasks`)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
