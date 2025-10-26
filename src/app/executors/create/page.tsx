"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';

export default function CreateExecutorPage() {
  const { addExecutor } = useScrum();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExecutor({ nome, cargo });
    router.push('/executors');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Criar Novo Executor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Executor</label>
                <input
                  type="text"
                  placeholder="Digite o nome do executor"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  type="text"
                  placeholder="Digite o cargo do executor"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
              >
                Criar Executor
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}