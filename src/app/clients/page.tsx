"use client";

import { useScrum } from '@/context/ScrumContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientsPage() {
  const { clientes, deleteCliente, getSprintsByCliente } = useScrum();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Todas as sprints e tarefas associadas serão removidas.')) {
      deleteCliente(id);
    }
  };

  const handleCreateNew = () => {
    router.push('/clients/create');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciamento de Clientes</h2>
            <button
              onClick={handleCreateNew}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Criar Novo Cliente
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Clientes Cadastrados</h2>
            {clientes.length === 0 ? (
              <p>Nenhum cliente cadastrado ainda.</p>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <li key={cliente.id} className="py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <div className="grow flex items-center gap-4 min-w-0">
                      <div className="text-sm text-gray-500 w-20">N/A</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{cliente.nome}</p>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Cliente
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4 ml-4">
                      <p className="text-sm text-gray-500">{getSprintsByCliente(cliente.id).length} sprints</p>
                      <p className="text-sm text-gray-500">{cliente.sprintAtiva ? getSprintsByCliente(cliente.id).find(s => s.id === cliente.sprintAtiva)?.name : 'Nenhuma'}</p>
                      <div className="flex gap-2">
                        <Link
                          href={`/sprint/create?clienteId=${cliente.id}`}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-800"
                        >
                          Criar Sprint
                        </Link>
                        <Link
                          href={`/dashboard?clienteId=${cliente.id}`}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-800"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => handleDelete(cliente.id)}
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