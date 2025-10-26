"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  isActive: boolean;
}

export interface Task {
  id: string;
  sprintId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  date?: string;
  timeSpent?: number;
}

export interface Cliente {
  id: string;
  nome: string;
  sprints: Sprint[];
  sprintAtiva?: string; // id da sprint ativa
}

interface ScrumContextType {
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'sprints'>) => Cliente;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addSprintToCliente: (clienteId: string, sprint: Omit<Sprint, 'id' | 'isActive'>) => Sprint;
  setSprintAtiva: (clienteId: string, sprintId: string) => void;
  getClienteById: (id: string) => Cliente | undefined;
  getTasksBySprint: (sprintId: string) => Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  exportData: () => { clientes: Cliente[], tasks: Task[] };
  importData: (data: { clientes: Cliente[], tasks: Task[] }) => void;
}

const ScrumContext = createContext<ScrumContextType | undefined>(undefined);

export function ScrumProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [idCounter, setIdCounter] = useState<number>(0); // Contador para IDs únicos

  // Função para gerar ID único
  const generateId = () => {
    setIdCounter(prev => prev + 1);
    return `id_${Date.now()}_${idCounter}`;
  };

  // Load from API on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.clientes) setClientes(data.clientes);
        if (data.tasks) setTasks(data.tasks);
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  // Save to API whenever state changes
  useEffect(() => {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientes, tasks }),
    }).catch(err => console.error('Failed to save data:', err));
  }, [clientes, tasks]);

  const addCliente = (cliente: Omit<Cliente, 'id' | 'sprints'>) => {
    const newCliente: Cliente = { ...cliente, id: generateId(), sprints: [] };
    setClientes([...clientes, newCliente]);
    return newCliente;
  };

  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    setClientes(clientes.map(cliente => cliente.id === id ? { ...cliente, ...updates } : cliente));
  };

  const deleteCliente = (id: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    // Remover tarefas associadas às sprints do cliente
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
      const sprintIds = cliente.sprints.map(s => s.id);
      setTasks(tasks.filter(task => !sprintIds.includes(task.sprintId)));
    }
  };

  const addSprintToCliente = (clienteId: string, sprint: Omit<Sprint, 'id' | 'isActive'>) => {
    const newSprint: Sprint = { ...sprint, id: generateId(), isActive: false };
    setClientes(clientes.map(cliente =>
      cliente.id === clienteId
        ? { ...cliente, sprints: [...cliente.sprints, newSprint] }
        : cliente
    ));
    return newSprint;
  };

  const setSprintAtiva = (clienteId: string, sprintId: string) => {
    setClientes(clientes.map(cliente =>
      cliente.id === clienteId
        ? {
            ...cliente,
            sprintAtiva: sprintId,
            sprints: cliente.sprints.map(sprint =>
              sprint.id === sprintId
                ? { ...sprint, isActive: true }
                : { ...sprint, isActive: false }
            )
          }
        : cliente
    ));
  };

  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: generateId() };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTasksBySprint = (sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId);
  };

  const exportData = () => {
    return { clientes, tasks };
  };

  const importData = (data: { clientes: Cliente[], tasks: Task[] }) => {
    setClientes(data.clientes);
    setTasks(data.tasks);
  };

  return (
    <ScrumContext.Provider value={{
      clientes,
      addCliente,
      updateCliente,
      deleteCliente,
      addSprintToCliente,
      setSprintAtiva,
      getClienteById,
      getTasksBySprint,
      addTask,
      updateTask,
      deleteTask,
      exportData,
      importData,
    }}>
      {children}
    </ScrumContext.Provider>
  );
}

export function useScrum() {
  const context = useContext(ScrumContext);
  if (!context) {
    throw new Error('useScrum must be used within a ScrumProvider');
  }
  return context;
}