'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Stats = {
  products: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/products.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: unknown[]) => setStats({ products: data.length }))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Productos</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats ? stats.products : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:border-primary transition-colors"
        >
          <p className="font-semibold text-gray-800">Gestionar Productos</p>
          <p className="text-sm text-gray-500 mt-1">Crear, editar y eliminar productos del catálogo</p>
        </Link>
      </div>
    </div>
  );
}
