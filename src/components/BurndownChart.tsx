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
  console.log('BurndownChart data:', data);
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="expected" stroke="#2B124C" name="Expectativa" />
          <Line type="monotone" dataKey="actual" stroke="#854F6C" name="Real" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}