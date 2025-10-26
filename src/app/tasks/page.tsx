"use client";

import { useState } from 'react';
import { useScrum, Task } from '@/context/ScrumContext';

export default function TasksPage() {
  const { sprints, tasks, addTask, updateTask, deleteTask, getTasksBySprint } = useScrum();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState('');
  const [date, setDate] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState('');

  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  const sprintTasks = selectedSprint ? getTasksBySprint(selectedSprint.id) : [];

  const addTaskToSprint = () => {
    if (selectedSprint) {
      addTask({ sprintId: selectedSprint.id, description, status: 'pending' });
      setDescription('');
    }
  };

  const updateTaskStatus = (id: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (newStatus === 'completed') {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setEditingTask(task);
        setAssignee(task.assignee || '');
        setDate(task.date || new Date().toISOString().split('T')[0]);
        setTimeSpent(task.timeSpent || 0);
      }
    } else {
      updateTask(id, { status: newStatus });
    }
  };

  const completeTask = () => {
    if (editingTask) {
      updateTask(editingTask.id, { status: 'completed', assignee, date, timeSpent });
      setEditingTask(null);
      setAssignee('');
      setDate('');
      setTimeSpent(0);
    }
  };

  const deleteTaskFromSprint = (id: string) => {
    deleteTask(id);
  };

  const startEditDescription = (taskId: string, currentDescription: string) => {
    setEditingDescription(taskId);
    setNewDescription(currentDescription);
  };

  const saveDescription = () => {
    if (editingDescription) {
      updateTask(editingDescription, { description: newDescription });
      setEditingDescription(null);
      setNewDescription('');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Tarefas do Sprint</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Selecionar Sprint</label>
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="">Selecione um sprint</option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
            ))}
          </select>
        </div>

        {selectedSprint && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Adicionar Atividade</h2>
              <input
                type="text"
                placeholder="Descrição da atividade"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
              <button
                onClick={addTaskToSprint}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Adicionar Atividade
              </button>
            </div>

        {editingTask && (
          <div className="mb-6 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-semibold mb-4">Concluir Atividade: {editingTask.description}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Quem fez"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Tempo (horas)"
                value={timeSpent}
                onChange={(e) => setTimeSpent(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="mt-4 space-x-2">
              <button
                onClick={completeTask}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Concluir
              </button>
              <button
                onClick={() => setEditingTask(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Atividades do Sprint</h2>
          <div className="space-y-4">
            {sprintTasks.map((task) => (
              <div key={task.id} className="border border-gray-300 rounded p-4">
                {editingDescription === task.id ? (
                  <div className="mb-2">
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={saveDescription}
                      className="mt-1 bg-green-500 text-white px-2 py-1 rounded text-sm mr-2"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingDescription(null)}
                      className="mt-1 bg-gray-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold flex justify-between items-center">
                    {task.description}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => startEditDescription(task.id, task.description)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Editar
                      </button>
                    )}
                  </h3>
                )}
                <p>Status: {task.status}</p>
                {task.status === 'completed' && (
                  <>
                    <p>Quem fez: {task.assignee}</p>
                    <p>Data: {task.date}</p>
                    <p>Tempo: {task.timeSpent} horas</p>
                  </>
                )}
                <div className="mt-2 space-x-2">
                  {task.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        className="bg-orange-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Em Andamento
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Concluir
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteTaskFromSprint(task.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}