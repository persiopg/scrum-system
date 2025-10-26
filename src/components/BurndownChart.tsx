"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  day: string;
  expected: number;
  actual: number;
}

interface BurndownChartProps {
  data: DataPoint[];
}

export function BurndownChart({ data }: BurndownChartProps) {
  console.log('BurndownChart received data:', data);

  if (!data || data.length === 0) {
    return <div className="w-full h-96 flex items-center justify-center text-gray-500">Nenhum dado disponível para o gráfico</div>;
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => {
              const formatNumber = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
              // `name` already contains the human readable label passed via the Line `name` prop
              return [typeof value === 'number' ? formatNumber(value) : value, name];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="expected"
            stroke="#2B124C"
            name="Expectativa (Restantes)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#854F6C"
            name="Real (Restantes)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}