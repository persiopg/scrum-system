function applyTaskUpdates(task) {
  const updates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const merged = Object.assign({}, task, updates);

  if (updates.status === 'completed' && !merged.date) {
    merged.date = new Date().toISOString().split('T')[0];
  }

  if (merged.timeSpent === null) {
    delete merged.timeSpent;
  }

  return merged;
}

function isCompleted(task) {
  return task.status === 'completed';
}

module.exports = {
  applyTaskUpdates,
  isCompleted
};
