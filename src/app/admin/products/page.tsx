'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type DBProduct = {
  id: number;
  product_code: string;
  name: string;
  category: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error,    setError]    = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/products.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: DBProduct[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar productos');
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    setDeleting(id);
    try {
      const res = await fetch('/api/product-delete.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Error al eliminar');
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Error de red');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/admin/products/edit"
          className="bg-primary text-white px-4 py-2 rounded text-sm font-semibold hover:bg-secondary"
        >
          + Nuevo producto
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400">Cargando…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoría</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{p.id}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{p.product_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/products/edit?id=${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deleting === p.id}
                      className="text-red-500 hover:underline disabled:opacity-40"
                    >
                      {deleting === p.id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No hay productos. <Link href="/admin/products/edit" className="text-blue-600 hover:underline">Crear el primero</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
