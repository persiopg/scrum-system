"use client";

import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExecutorsPage() {
  const { executores, deleteExecutor } = useScrum();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este executor?')) {
      deleteExecutor(id);
    }
  };

  const handleCreateNew = () => {
    router.push('/executors/create');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciamento de Executores</h2>
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Criar Novo Executor
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Executores Cadastrados</h2>
            {executores.length === 0 ? (
              <p>Nenhum executor cadastrado ainda.</p>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {executores.map((executor) => (
                  <li key={executor.id} className="py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <div className="grow flex items-center gap-4 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{executor.nome}</p>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {executor.cargo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4 ml-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/executors/${executor.id}/edit`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-800"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(executor.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}