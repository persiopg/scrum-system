"use client";

import { useState } from 'react';
import { useScrum } from '@/context/ScrumContext';
import { useRouter, useParams } from 'next/navigation';

export default function EditExecutorPage() {
  const { getExecutorById, updateExecutor } = useScrum();
  const router = useRouter();
  const params = useParams();
  const executorId = params.executorId as string;

  const executor = getExecutorById(executorId);

  const [nome, setNome] = useState(executor?.nome || '');
  const [cargo, setCargo] = useState(executor?.cargo || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateExecutor(executorId, { nome, cargo });
    router.push('/executors');
  };

  if (!executor) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <p>Executor não encontrado.</p>
            <button
              onClick={() => router.push('/executors')}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Voltar para Executores
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Editar Executor</h2>
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

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/executors')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}