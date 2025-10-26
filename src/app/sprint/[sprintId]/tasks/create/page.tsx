"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter, useParams } from 'next/navigation';

export default function CreateTaskPage() {
  const { sprints, addTask } = useScrum();
  const router = useRouter();
  const params = useParams();
  const sprintId = params.sprintId as string;

  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [date, setDate] = useState('');
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const sprint = sprints.find(s => s.id === sprintId);

  if (!sprint) {
    return <div>Sprint não encontrada</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      sprintId,
      description,
      status: 'pending',
      assignee: assignee || undefined,
      date: date || undefined,
      timeSpent: timeSpent || undefined,
    });
    router.push(`/sprint/${sprintId}/tasks`);
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Criar Nova Atividade</h2>
            <p className="text-gray-600 mb-4">Sprint: {sprint.name}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição da Atividade</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                  placeholder="Descreva a atividade..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsável (opcional)</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data (opcional)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tempo Gasto (horas, opcional)</label>
                <input
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
                >
                  Criar Atividade
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/sprint/${sprintId}/tasks`)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}