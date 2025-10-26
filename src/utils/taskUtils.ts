export type Task = {
  id: string;
  sprintId: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  date?: string; // completion date
  timeSpent?: number;
};

export function applyTaskUpdates(task: Task, updates: Partial<Task>): Task {
  const merged: Task = { ...task, ...updates };

  // If status becomes completed and there's no date, set today's date
  if (updates.status === 'completed' && !merged.date) {
    merged.date = new Date().toISOString().split('T')[0];
  }

  // Normalize timeSpent: ensure it's a number or undefined
  if (merged.timeSpent === null) {
    delete merged.timeSpent;
  }

  return merged;
}

// small helpers exported for tests
export function isCompleted(task: Task) {
  return task.status === 'completed';
}
