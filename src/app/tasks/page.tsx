"use client";

import { useState } from 'react';

interface Task {
  id: number;
  description: string;
  assignee: string;
  date: string;
  timeSpent: number; // in hours
  status: 'pending' | 'in-progress' | 'completed';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [date, setDate] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

  const addTask = () => {
    const newTask: Task = {
      id: Date.now(),
      description,
      assignee,
      date,
      timeSpent,
      status,
    };
    setTasks([...tasks, newTask]);
    // Reset form
    setDescription('');
    setAssignee('');
    setDate('');
    setTimeSpent(0);
    setStatus('pending');
  };

  const updateTaskStatus = (id: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Tarefas</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Tarefa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Descrição da tarefa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
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
              placeholder="Tempo de execução (horas)"
              value={timeSpent}
              onChange={(e) => setTimeSpent(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="pending">Pendente</option>
              <option value="in-progress">Em Andamento</option>
              <option value="completed">Concluída</option>
            </select>
          </div>
          <button
            onClick={addTask}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Tarefa
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Lista de Tarefas</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-300 rounded p-4">
                <h3 className="font-semibold">{task.description}</h3>
                <p>Quem fez: {task.assignee}</p>
                <p>Data: {task.date}</p>
                <p>Tempo: {task.timeSpent} horas</p>
                <p>Status: {task.status}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => updateTaskStatus(task.id, 'pending')}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Pendente
                  </button>
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
                    Concluída
                  </button>
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