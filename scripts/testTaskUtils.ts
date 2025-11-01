import { applyTaskUpdates, isCompleted, Task } from '../src/utils/taskUtils';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function runTests() {
  // debug logs removed

  const base: Task = {
    id: 't1',
    sprintId: 's1',
    description: 'Teste',
    status: 'pending',
  };

  // 1) Mark completed should set date if missing
  const updated1 = applyTaskUpdates(base, { status: 'completed' });
  assert(isCompleted(updated1), 'updated1 should be completed');
  assert(typeof updated1.date === 'string' && updated1.date.length === 10, 'updated1 should have a date set');

  // 2) Update assignee/timeSpent keeps values
  const updated2 = applyTaskUpdates(base, { assignee: 'João', timeSpent: 3.5 });
  assert(updated2.assignee === 'João', 'assignee should be set');
  assert(updated2.timeSpent === 3.5, 'timeSpent should be set');

  // 3) Preserve date if already present when marking completed
  const baseWithDate: Task = { ...base, date: '2025-10-01' };
  const updated3 = applyTaskUpdates(baseWithDate, { status: 'completed' });
  assert(updated3.date === '2025-10-01', 'existing date should be preserved');

  // tests success log removed
}

try {
  runTests();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('Tests failed:', msg);
  process.exit(1);
}
