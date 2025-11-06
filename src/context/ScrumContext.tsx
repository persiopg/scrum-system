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
  // New: more descriptive status for the sprint (kept as string for backwards compatibility)
  status?: string;
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

export interface Executor {
  id: string;
  nome: string;
  cargo: string;
}

interface ScrumContextType {
  clientes: Cliente[];
  executores: Executor[];
  tasks: Task[];
  sprints: Sprint[];
  selectedClienteId?: string | null;
  setSelectedClienteId: (id: string | null) => void;
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<Cliente>;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addExecutor: (executor: Omit<Executor, 'id'>) => Promise<Executor>;
  updateExecutor: (id: string, updates: Partial<Executor>) => void;
  deleteExecutor: (id: string) => void;
  getExecutorById: (id: string) => Executor | undefined;
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
  exportData: () => { clientes: Cliente[], executores: Executor[], sprints: Sprint[], tasks: Task[] };
  importData: (data: { clientes: Cliente[], executores: Executor[], sprints: Sprint[], tasks: Task[] }) => void;
  saveData: () => Promise<void>;
}

const ScrumContext = createContext<ScrumContextType | undefined>(undefined);

export function ScrumProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [executores, setExecutores] = useState<Executor[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const clientesRef = useRef(clientes);
  const executoresRef = useRef(executores);
  const sprintsRef = useRef(sprints);
  const tasksRef = useRef(tasks);

  useEffect(() => {
    clientesRef.current = clientes;
  }, [clientes]);

  useEffect(() => {
    executoresRef.current = executores;
  }, [executores]);

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
        if (data.executores) setExecutores(data.executores);
        if (data.sprints) {
          // Backwards-compatible: ensure status exists on each sprint
          const normalizedSprints = data.sprints.map((s: unknown) => {
            let rawStatus: unknown = undefined;
            let isActive: unknown = undefined;
            if (typeof s === 'object' && s !== null) {
              const obj = s as Record<string, unknown>;
              rawStatus = obj['status'];
              isActive = obj['isActive'];
            }
            const allowed = ['planned', 'in-progress', 'completed', 'cancelled'];
            const status = (typeof rawStatus === 'string' && allowed.includes(rawStatus)) ? rawStatus as string : (isActive ? 'in-progress' : 'planned');
            return { ...(s as object), status } as Sprint;
          });
          setSprints(normalizedSprints);
        }
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
            // Ensure status consistency: if sprint isActive then status -> in-progress
            const raw = sprint.status;
            const allowed = ['planned', 'in-progress', 'completed', 'cancelled'];
            const status = (typeof raw === 'string' && allowed.includes(raw)) ? raw : (sprint.isActive ? 'in-progress' : 'planned');
            return { ...sprint, status } as Sprint;
          });
          setSprints(correctedSprints);
        }
        setIsLoaded(true);
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  // hydrate selectedClienteId from localStorage after data is loaded
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedCliente') : null;
      if (stored) {
        const exists = clientes.find(c => c.id === stored);
        if (exists) setSelectedClienteId(stored);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [isLoaded, clientes]);

  // Save to API whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientes: clientesRef.current, executores: executoresRef.current, sprints: sprintsRef.current, tasks: tasksRef.current }),
    }).catch(err => console.error('Failed to save data:', err));
  }, [clientes, executores, sprints, tasks, isLoaded]);

  const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
    const newCliente: Cliente = { ...cliente, id: generateId() };
    const newClientes = [...clientesRef.current, newCliente];
    clientesRef.current = newClientes;
    setClientes(newClientes);
    await saveData();
    return newCliente;
  };

  const addExecutor = async (executor: Omit<Executor, 'id'>) => {
    const newExecutor: Executor = { ...executor, id: generateId() };
    const newExecutores = [...executoresRef.current, newExecutor];
    executoresRef.current = newExecutores;
    setExecutores(newExecutores);
    await saveData();
    return newExecutor;
  };

  const updateExecutor = (id: string, updates: Partial<Executor>) => {
    setExecutores(executores.map(executor => executor.id === id ? { ...executor, ...updates } : executor));
  };

  const deleteExecutor = (id: string) => {
    setExecutores(executores.filter(executor => executor.id !== id));
  };

  const getExecutorById = (id: string) => {
    return executores.find(executor => executor.id === id);
  };

  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    setClientes(clientes.map(cliente => cliente.id === id ? { ...cliente, ...updates } : cliente));
  };

  const deleteCliente = (id: string) => {
    const sprintsToRemove = sprintsRef.current.filter(sprint => sprint.clienteId === id);
    const sprintIds = sprintsToRemove.map(sprint => sprint.id);

    // Remove cliente e limpa referência de sprint ativa que caiu junto
    const remainingClientes = clientesRef.current
      .filter(cliente => cliente.id !== id)
      .map(cliente => (sprintIds.includes(cliente.sprintAtiva ?? '')
        ? { ...cliente, sprintAtiva: undefined }
        : cliente));
    clientesRef.current = remainingClientes;
    setClientes(remainingClientes);

    // Remove sprints e tarefas que pertenciam ao cliente
    const remainingSprints = sprintsRef.current.filter(sprint => sprint.clienteId !== id);
    sprintsRef.current = remainingSprints;
    setSprints(remainingSprints);

    const remainingTasks = tasksRef.current.filter(task => !sprintIds.includes(task.sprintId));
    tasksRef.current = remainingTasks;
    setTasks(remainingTasks);

    // Garantir que cliente selecionado não aponte para registro inexistente
    if (selectedClienteId === id) {
      setSelectedClienteId(null);
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedCliente');
        }
      } catch {
        // ignore storage errors
      }
    }

    saveData();
  };

  const addSprint = async (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = { ...sprint, id: generateId(), status: sprint.status ? sprint.status : (sprint.isActive ? 'in-progress' : 'planned') };
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
        ? { ...sprint, isActive: sprint.id === sprintId, status: sprint.id === sprintId ? 'in-progress' : (sprint.status ? sprint.status : 'planned') }
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
        s.id === sprintId ? { ...s, isActive: false, status: 'planned' } : s
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
    const newTasksArray = [...tasksRef.current, newTask];
    tasksRef.current = newTasksArray;
    setTasks(newTasksArray);

    // Update totalTasks on the related sprint
    sprintsRef.current = sprintsRef.current.map(s =>
      s.id === newTask.sprintId ? { ...s, totalTasks: (s.totalTasks || 0) + 1 } : s
    );
    setSprints(sprintsRef.current);
    // Persist
    saveData();
  };

  // Função para adicionar múltiplas tarefas de uma vez
  const addTasks = async (tasksToAdd: Omit<Task, 'id'>[]) => {
    const newTasks = tasksToAdd.map(task => ({ ...task, id: generateId() }));
    const newTasksArray = [...tasksRef.current, ...newTasks];
    tasksRef.current = newTasksArray;
    setTasks(newTasksArray);

    // Update totalTasks counts per sprint
    const counts: Record<string, number> = {};
    newTasks.forEach(t => { counts[t.sprintId] = (counts[t.sprintId] || 0) + 1; });
    sprintsRef.current = sprintsRef.current.map(s => ({
      ...s,
      totalTasks: (s.totalTasks || 0) + (counts[s.id] || 0)
    }));
    setSprints(sprintsRef.current);
    await saveData();
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    // Update tasks using refs to keep single source of truth
    const updatedTasks = tasksRef.current.map(t => t.id === id ? { ...t, ...updates } : t);
    tasksRef.current = updatedTasks;
    setTasks(updatedTasks);

    // Re-evaluate sprint completion status for the affected sprint
    const affected = updatedTasks.find(t => t.id === id);
    if (!affected) return;
    const sprintId = affected.sprintId;
    const sprintTasks = updatedTasks.filter(t => t.sprintId === sprintId);
    const allCompleted = sprintTasks.length > 0 && sprintTasks.every(t => t.status === 'completed');

    const sprint = sprintsRef.current.find(s => s.id === sprintId);
    if (!sprint) return;

    if (allCompleted) {
      // mark sprint completed and deactivate it
      sprintsRef.current = sprintsRef.current.map(s => s.id === sprintId ? { ...s, isActive: false, status: 'completed' } : s);
      setSprints(sprintsRef.current);

      // If this sprint was the active sprint for its cliente, clear sprintAtiva
      clientesRef.current = clientesRef.current.map(c => c.id === sprint.clienteId ? { ...c, sprintAtiva: undefined } : c);
      setClientes(clientesRef.current);
    } else {
      // Not all completed: if sprint was marked completed, revert to appropriate status
      sprintsRef.current = sprintsRef.current.map(s =>
        s.id === sprintId ? { ...s, status: s.isActive ? 'in-progress' : 'planned' } : s
      );
      setSprints(sprintsRef.current);
    }

    // Persist changes
    saveData();
  };

  const deleteTask = (id: string) => {
    const toDelete = tasksRef.current.find(t => t.id === id);
    if (!toDelete) return;
    const newTasks = tasksRef.current.filter(task => task.id !== id);
    tasksRef.current = newTasks;
    setTasks(newTasks);

    // Update totalTasks on the related sprint
    sprintsRef.current = sprintsRef.current.map(s =>
      s.id === toDelete.sprintId ? { ...s, totalTasks: Math.max(0, (s.totalTasks || 1) - 1) } : s
    );
    setSprints(sprintsRef.current);

    // Re-evaluate completion for that sprint (if tasks now all completed)
    const sprintTasks = newTasks.filter(t => t.sprintId === toDelete.sprintId);
    if (sprintTasks.length > 0 && sprintTasks.every(t => t.status === 'completed')) {
      sprintsRef.current = sprintsRef.current.map(s => s.id === toDelete.sprintId ? { ...s, isActive: false, status: 'completed' } : s);
      setSprints(sprintsRef.current);
      const sprintObj = sprintsRef.current.find(s => s.id === toDelete.sprintId);
      if (sprintObj) {
        clientesRef.current = clientesRef.current.map(c => c.id === sprintObj.clienteId ? { ...c, sprintAtiva: undefined } : c);
        setClientes(clientesRef.current);
      }
    }

    // Persist
    saveData();
  };

  const getTasksBySprint = (sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId);
  };

  const exportData = () => {
    return { clientes, executores, sprints, tasks };
  };

  const importData = (data: { clientes: Cliente[], executores: Executor[], sprints: Sprint[], tasks: Task[] }) => {
    setClientes(data.clientes);
    setExecutores(data.executores);
    setSprints(data.sprints);
    setTasks(data.tasks);
  };

  const saveData = async () => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientes: clientesRef.current, executores: executoresRef.current, sprints: sprintsRef.current, tasks: tasksRef.current }),
      });
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  };

  const _setSelectedClienteId = async (id: string | null) => {
    setSelectedClienteId(id);
    try {
      if (typeof window !== 'undefined') {
        if (id) localStorage.setItem('selectedCliente', id);
        else localStorage.removeItem('selectedCliente');
      }
    } catch {
      // ignore storage errors
    }
  };

  return (
    <ScrumContext.Provider value={{
      clientes,
      executores,
      tasks,
      sprints,
      addCliente,
      updateCliente,
      deleteCliente,
      addExecutor,
      updateExecutor,
      deleteExecutor,
      getExecutorById,
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
      selectedClienteId,
      setSelectedClienteId: _setSelectedClienteId,
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