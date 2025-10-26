"use client";

import React from 'react';

interface SwitchToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function SwitchToggle({ isActive, onToggle }: SwitchToggleProps) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isActive}
        onChange={onToggle}
        className="sr-only"
      />
      <div className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${
        isActive ? 'bg-green-600' : 'bg-gray-300'
      }`}>
        <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
          isActive ? 'translate-x-4' : 'translate-x-0'
        }`}></span>
      </div>
      <span className="ml-2 text-sm font-medium">
        {isActive ? 'Ativa' : 'Inativa'}
      </span>
    </label>
  );
}