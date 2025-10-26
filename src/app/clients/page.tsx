"use client";

import { useState } from 'react';
import { useScrum, Cliente } from '@/context/ScrumContext';
import Link from 'next/link';

export default function ClientsPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useScrum();
  const [nome, setNome] = useState('');
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editingNome, setEditingNome] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCliente({ nome });
    setNome('');
  };

  const startEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setEditingNome(cliente.nome);
  };

  const saveEdit = () => {
    if (editingCliente) {
      updateCliente(editingCliente.id, { nome: editingNome });
      setEditingCliente(null);
      setEditingNome('');
    }
  };

  const cancelEdit = () => {
    setEditingCliente(null);
    setEditingNome('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Todas as sprints e tarefas associadas serão removidas.')) {
      deleteCliente(id);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Clientes</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Cliente</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Nome do cliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              required
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Adicionar
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Clientes Cadastrados</h2>
          {clientes.length === 0 ? (
            <p>Nenhum cliente cadastrado ainda.</p>
          ) : (
            <div className="space-y-4">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="border border-gray-300 rounded p-4">
                  {editingCliente?.id === cliente.id ? (
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={editingNome}
                        onChange={(e) => setEditingNome(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        onClick={saveEdit}
                        className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-900"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">{cliente.nome}</h3>
                        <div className="space-x-2">
                          <button
                            onClick={() => startEdit(cliente)}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="bg-purple-900 text-white px-3 py-1 rounded text-sm hover:bg-purple-950"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                      <p>Sprints: {cliente.sprints.length}</p>
                      <p>Sprint Ativa: {cliente.sprintAtiva ? cliente.sprints.find(s => s.id === cliente.sprintAtiva)?.name : 'Nenhuma'}</p>
                      <div className="mt-2">
                        <Link
                          href={`/sprint?clienteId=${cliente.id}`}
                          className="text-purple-600 hover:underline mr-4"
                        >
                          Criar Sprint
                        </Link>
                        <Link
                          href={`/dashboard?clienteId=${cliente.id}`}
                          className="text-purple-600 hover:underline"
                        >
                          Ver Dashboard
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}