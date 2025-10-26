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
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Nome</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Sprints</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Sprint Ativa</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{cliente.nome}</td>
                      <td className="border border-gray-300 px-4 py-2">{getSprintsByCliente(cliente.id).length}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {cliente.sprintAtiva ? getSprintsByCliente(cliente.id).find(s => s.id === cliente.sprintAtiva)?.name : 'Nenhuma'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Link
                          href={`/sprint/create?clienteId=${cliente.id}`}
                          className="text-purple-600 hover:underline mr-2"
                        >
                          Criar Sprint
                        </Link>
                        <Link
                          href={`/dashboard?clienteId=${cliente.id}`}
                          className="text-purple-600 hover:underline mr-2"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}