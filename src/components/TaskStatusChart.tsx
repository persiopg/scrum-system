"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TaskStatusChartProps {
  tasks: Array<{ status: string }>;
}

const COLORS = {
  pending: '#8884d8',
  'in-progress': '#82ca9d',
  completed: '#ffc658',
};

export function TaskStatusChart({ tasks }: TaskStatusChartProps) {
  const data = [
    { name: 'Pendentes', value: tasks.filter(t => t.status === 'pending').length, color: COLORS.pending },
    { name: 'Em Andamento', value: tasks.filter(t => t.status === 'in-progress').length, color: COLORS['in-progress'] },
    { name: 'Concluídas', value: tasks.filter(t => t.status === 'completed').length, color: COLORS.completed },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}