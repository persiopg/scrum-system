(async () => {
  // Carrega o módulo .cjs sem usar require()
  const mod = await import('../lib/utils/taskUtils.cjs');
  const taskUtils = mod.default || mod;
  const { applyTaskUpdates, isCompleted } = taskUtils;

  function assert(cond, msg) {
    if (!cond) throw new Error(msg);
  }

  function runTests() {
    console.log('Running JS taskUtils tests...');

    const base = {
      id: 't1',
      sprintId: 's1',
      description: 'Teste',
      status: 'pending',
    };

    const updated1 = applyTaskUpdates(base, { status: 'completed' });
    assert(isCompleted(updated1), 'updated1 should be completed');
    assert(typeof updated1.date === 'string' && updated1.date.length === 10, 'updated1 should have a date set');

    const updated2 = applyTaskUpdates(base, { assignee: 'João', timeSpent: 3.5 });
    assert(updated2.assignee === 'João', 'assignee should be set');
    assert(updated2.timeSpent === 3.5, 'timeSpent should be set');

    const baseWithDate = Object.assign({}, base, { date: '2025-10-01' });
    const updated3 = applyTaskUpdates(baseWithDate, { status: 'completed' });
    assert(updated3.date === '2025-10-01', 'existing date should be preserved');

    console.log('All JS taskUtils tests passed ✅');
  }

  try {
    runTests();
  } catch (err) {
    console.error('Tests failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})().catch(err => {
  console.error('Failed to load taskUtils:', err && err.message ? err.message : err);
  process.exit(1);
});
