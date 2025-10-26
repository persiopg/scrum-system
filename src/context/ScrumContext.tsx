"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
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

interface ScrumContextType {
  sprints: Sprint[];
  tasks: Task[];
  addSprint: (sprint: Omit<Sprint, 'id'>) => Sprint;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksBySprint: (sprintId: string) => Task[];
}

const ScrumContext = createContext<ScrumContextType | undefined>(undefined);

export function ScrumProvider({ children }: { children: ReactNode }) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = { ...sprint, id: Date.now().toString() };
    setSprints([...sprints, newSprint]);
    return newSprint;
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: Date.now().toString() };
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

  return (
    <ScrumContext.Provider value={{
      sprints,
      tasks,
      addSprint,
      addTask,
      updateTask,
      deleteTask,
      getTasksBySprint,
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