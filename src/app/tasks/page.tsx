"use client";

import { useState } from 'react';

interface Task {
  id: number;
  description: string;
  assignee?: string;
  date?: string;
  timeSpent?: number; // in hours
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState('');
  const [date, setDate] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);

  const addTask = () => {
    const newTask: Task = {
      id: Date.now(),
      description,
      status: 'pending',
    };
    setTasks([...tasks, newTask]);
    setDescription('');
  };

  const updateTaskStatus = (id: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (newStatus === 'completed') {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setEditingTask(task);
        setAssignee(task.assignee || '');
        setDate(task.date || new Date().toISOString().split('T')[0]);
        setTimeSpent(task.timeSpent || 0);
      }
    } else {
      setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
    }
  };

  const completeTask = () => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, status: 'completed', assignee, date, timeSpent } 
          : task
      ));
      setEditingTask(null);
      setAssignee('');
      setDate('');
      setTimeSpent(0);
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Tarefas do Sprint</h1>

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
            onClick={addTask}
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
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-300 rounded p-4">
                <h3 className="font-semibold">{task.description}</h3>
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
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}