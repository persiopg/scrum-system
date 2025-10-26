"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Sprint {
  id: string;
  clienteId: string;
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
  sprintAtiva?: string; // id da sprint ativa
}

interface ScrumContextType {
  clientes: Cliente[];
  sprints: Sprint[];
  addCliente: (cliente: Omit<Cliente, 'id'>) => Cliente;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => Sprint;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  moveSprintToCliente: (sprintId: string, newClienteId: string) => void;
  deleteSprint: (sprintId: string) => void;
  setSprintAtiva: (clienteId: string, sprintId: string) => void;
  getClienteById: (id: string) => Cliente | undefined;
  getSprintsByCliente: (clienteId: string) => Sprint[];
  getTasksBySprint: (sprintId: string) => Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  addTasks: (tasks: Omit<Task, 'id'>[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  exportData: () => { clientes: Cliente[], sprints: Sprint[], tasks: Task[] };
  importData: (data: { clientes: Cliente[], sprints: Sprint[], tasks: Task[] }) => void;
}

const ScrumContext = createContext<ScrumContextType | undefined>(undefined);

export function ScrumProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Função para gerar ID único usando crypto.randomUUID se disponível, senão timestamp + contador
  let idCounter = 0;
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para ambientes sem crypto.randomUUID
    return `id_${Date.now()}_${++idCounter}`;
  };

  // Load from API on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.clientes) setClientes(data.clientes);
        if (data.sprints) setSprints(data.sprints);
        if (data.tasks) setTasks(data.tasks);

        // Corrigir dados: definir sprintAtiva e garantir apenas uma ativa por cliente
        setTimeout(() => {
          if (data.sprints && data.clientes) {
            const correctedClientes = data.clientes.map((cliente: Cliente) => {
              const activeSprints = data.sprints.filter((s: Sprint) => s.clienteId === cliente.id && s.isActive);
              if (activeSprints.length > 0 && !cliente.sprintAtiva) {
                return { ...cliente, sprintAtiva: activeSprints[0].id };
              }
              return cliente;
            });
            setClientes(correctedClientes);

            const correctedSprints = data.sprints.map((sprint: Sprint) => {
              const activeSprints = data.sprints.filter((s: Sprint) => s.clienteId === sprint.clienteId && s.isActive);
              if (activeSprints.length > 1 && sprint.id !== activeSprints[0].id && sprint.isActive) {
                return { ...sprint, isActive: false };
              }
              return sprint;
            });
            setSprints(correctedSprints);
          }
        }, 0);
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  // Save to API whenever state changes
  useEffect(() => {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientes, sprints, tasks }),
    }).catch(err => console.error('Failed to save data:', err));
  }, [clientes, sprints, tasks]);

  const addCliente = (cliente: Omit<Cliente, 'id'>) => {
    const newCliente: Cliente = { ...cliente, id: generateId() };
    setClientes([...clientes, newCliente]);
    return newCliente;
  };

  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    setClientes(clientes.map(cliente => cliente.id === id ? { ...cliente, ...updates } : cliente));
  };

  const deleteCliente = (id: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    // Remover sprints associadas
    setSprints(sprints.filter(sprint => sprint.clienteId !== id));
    // Remover tarefas associadas
    const sprintIds = sprints.filter(s => s.clienteId === id).map(s => s.id);
    setTasks(tasks.filter(task => !sprintIds.includes(task.sprintId)));
  };

  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = { ...sprint, id: generateId() };
    setSprints([...sprints, newSprint]);
    return newSprint;
  };

  const updateSprint = (sprintId: string, updates: Partial<Sprint>) => {
    setSprints(sprints.map(sprint => sprint.id === sprintId ? { ...sprint, ...updates } : sprint));
  };

  const moveSprintToCliente = (sprintId: string, newClienteId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;

    // Se a sprint era ativa no cliente antigo, desativar
    if (sprint.isActive) {
      setClientes(clientes.map(cliente =>
        cliente.id === sprint.clienteId
          ? { ...cliente, sprintAtiva: undefined }
          : cliente
      ));
    }

    setSprints(sprints.map(s => s.id === sprintId ? { ...s, clienteId: newClienteId, isActive: false } : s));
  };

  const deleteSprint = (sprintId: string) => {
    setSprints(sprints.filter(sprint => sprint.id !== sprintId));
    // Remover tarefas associadas
    setTasks(tasks.filter(task => task.sprintId !== sprintId));
  };

  const setSprintAtiva = (clienteId: string, sprintId: string) => {
    setClientes(clientes.map(cliente =>
      cliente.id === clienteId
        ? { ...cliente, sprintAtiva: sprintId }
        : cliente
    ));
    setSprints(sprints.map(sprint =>
      sprint.clienteId === clienteId
        ? { ...sprint, isActive: sprint.id === sprintId }
        : sprint
    ));
  };

  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  const getSprintsByCliente = (clienteId: string) => {
    return sprints.filter(sprint => sprint.clienteId === clienteId);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: generateId() };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  // Função para adicionar múltiplas tarefas de uma vez
  const addTasks = (tasksToAdd: Omit<Task, 'id'>[]) => {
    const newTasks = tasksToAdd.map(task => ({ ...task, id: generateId() }));
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
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
    return { clientes, sprints, tasks };
  };

  const importData = (data: { clientes: Cliente[], sprints: Sprint[], tasks: Task[] }) => {
    setClientes(data.clientes);
    setSprints(data.sprints);
    setTasks(data.tasks);
  };

  return (
    <ScrumContext.Provider value={{
      clientes,
      sprints,
      addCliente,
      updateCliente,
      deleteCliente,
      addSprint,
      updateSprint,
      moveSprintToCliente,
      deleteSprint,
      setSprintAtiva,
      getClienteById,
      getSprintsByCliente,
      getTasksBySprint,
      addTask,
      addTasks,
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