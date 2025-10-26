"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

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
  tasks: Task[];
  sprints: Sprint[];
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<Cliente>;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => Promise<Sprint>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  moveSprintToCliente: (sprintId: string, newClienteId: string) => void;
  deleteSprint: (sprintId: string) => void;
  setSprintAtiva: (clienteId: string, sprintId: string) => Promise<void>;
  toggleSprintActive: (sprintId: string) => Promise<void>;
  getClienteById: (id: string) => Cliente | undefined;
  getSprintsByCliente: (clienteId: string) => Sprint[];
  getTasksBySprint: (sprintId: string) => Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  addTasks: (tasks: Omit<Task, 'id'>[]) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  exportData: () => { clientes: Cliente[], sprints: Sprint[], tasks: Task[] };
  importData: (data: { clientes: Cliente[], sprints: Sprint[], tasks: Task[] }) => void;
  saveData: () => Promise<void>;
}

const ScrumContext = createContext<ScrumContextType | undefined>(undefined);

export function ScrumProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const clientesRef = useRef(clientes);
  const sprintsRef = useRef(sprints);
  const tasksRef = useRef(tasks);

  useEffect(() => {
    clientesRef.current = clientes;
  }, [clientes]);

  useEffect(() => {
    sprintsRef.current = sprints;
  }, [sprints]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

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
        setIsLoaded(true);
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  // Save to API whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    console.log('Saving with sprints:', sprintsRef.current);
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientes: clientesRef.current, sprints: sprintsRef.current, tasks: tasksRef.current }),
    }).catch(err => console.error('Failed to save data:', err));
  }, [clientes, sprints, tasks, isLoaded]);

  const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
    const newCliente: Cliente = { ...cliente, id: generateId() };
    const newClientes = [...clientesRef.current, newCliente];
    clientesRef.current = newClientes;
    setClientes(newClientes);
    await saveData();
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

  const addSprint = async (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = { ...sprint, id: generateId() };
    console.log('Adding sprint:', newSprint);
    const newSprints = [...sprintsRef.current, newSprint];
    sprintsRef.current = newSprints;
    setSprints(newSprints);
    await saveData();
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

  const setSprintAtiva = async (clienteId: string, sprintId: string) => {
    const newClientes = clientesRef.current.map(cliente =>
      cliente.id === clienteId
        ? { ...cliente, sprintAtiva: sprintId }
        : cliente
    );
    clientesRef.current = newClientes;
    setClientes(newClientes);
    const newSprints = sprintsRef.current.map(sprint =>
      sprint.clienteId === clienteId
        ? { ...sprint, isActive: sprint.id === sprintId }
        : sprint
    );
    sprintsRef.current = newSprints;
    setSprints(newSprints);
    await saveData();
  };

  const toggleSprintActive = async (sprintId: string) => {
    const sprint = sprintsRef.current.find(s => s.id === sprintId);
    if (!sprint) return;

    const cliente = clientesRef.current.find(c => c.id === sprint.clienteId);
    if (!cliente) return;

    if (sprint.isActive) {
      // Desativar: remover sprintAtiva
      const newClientes = clientesRef.current.map(c =>
        c.id === cliente.id ? { ...c, sprintAtiva: undefined } : c
      );
      clientesRef.current = newClientes;
      setClientes(newClientes);
      const newSprints = sprintsRef.current.map(s =>
        s.id === sprintId ? { ...s, isActive: false } : s
      );
      sprintsRef.current = newSprints;
      setSprints(newSprints);
    } else {
      // Ativar: definir como sprintAtiva
      await setSprintAtiva(cliente.id, sprintId);
    }
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
  const addTasks = async (tasksToAdd: Omit<Task, 'id'>[]) => {
    const newTasks = tasksToAdd.map(task => ({ ...task, id: generateId() }));
    const newTasksArray = [...tasksRef.current, ...newTasks];
    tasksRef.current = newTasksArray;
    setTasks(newTasksArray);
    await saveData();
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

  const saveData = async () => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientes: clientesRef.current, sprints: sprintsRef.current, tasks: tasksRef.current }),
      });
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  };

  return (
    <ScrumContext.Provider value={{
      clientes,
      tasks,
      sprints,
      addCliente,
      updateCliente,
      deleteCliente,
      addSprint,
      updateSprint,
      moveSprintToCliente,
      deleteSprint,
      setSprintAtiva,
      toggleSprintActive,
      getClienteById,
      getSprintsByCliente,
      getTasksBySprint,
      addTask,
      addTasks,
      updateTask,
      deleteTask,
      exportData,
      importData,
      saveData,
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