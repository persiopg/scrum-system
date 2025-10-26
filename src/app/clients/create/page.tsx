"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';

export default function CreateClientPage() {
  const { addCliente } = useScrum();
  const router = useRouter();
  const [nome, setNome] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCliente({ nome });
    router.push('/clients');
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Cliente</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
              <input
                type="text"
                placeholder="Digite o nome do cliente"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Criar Cliente
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}