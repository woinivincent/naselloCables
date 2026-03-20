'use client';

import { useEffect, useState, useCallback } from 'react';

type DBProduct = {
  id: number;
  name: string;
  category: string;
};

type ProductPrice = {
  product_category: string;
  code: string;
  price_per_meter: number;
  supplier: string;
};

// Format number as ARS without cents
const formatARS = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const supplierBadge = (supplier: string) => {
  if (supplier === 'Nasello')   return 'bg-blue-100 text-blue-800';
  if (supplier === 'Wireflex')  return 'bg-green-100 text-green-800';
  if (supplier === 'Conduelec') return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-700';
};

export default function PricesPage() {
  const [products,       setProducts]       = useState<DBProduct[]>([]);
  const [selectedCat,    setSelectedCat]    = useState('');
  const [prices,         setPrices]         = useState<ProductPrice[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingPrices,  setLoadingPrices]  = useState(false);
  const [error,          setError]          = useState('');

  // Inline editing: key = code
  const [editingCell, setEditingCell] = useState<Record<string, string>>({});
  const [savingCell,  setSavingCell]  = useState<string | null>(null);

  // Load product list once
  useEffect(() => {
    fetch('/api/products.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: DBProduct[]) => {
        setProducts(data.map((p) => ({ id: p.id, name: p.name, category: p.category })));
        if (data.length > 0) setSelectedCat(data[0].category);
      })
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setLoading(false));
  }, []);

  // Load prices whenever selectedCat changes
  useEffect(() => {
    if (!selectedCat) return;
    setLoadingPrices(true);
    setEditingCell({});
    fetch(`/api/product-prices.php?category=${encodeURIComponent(selectedCat)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: ProductPrice[]) => setPrices(data))
      .catch(() => setError('Error al cargar precios'))
      .finally(() => setLoadingPrices(false));
  }, [selectedCat]);

  const getPrice = useCallback(
    (code: string): ProductPrice | undefined =>
      prices.find((p) => p.code === code),
    [prices]
  );

  const startEdit = (code: string, current: number) => {
    setEditingCell((prev) => ({ ...prev, [code]: String(current) }));
  };

  const cancelEdit = (code: string) => {
    setEditingCell((prev) => { const n = { ...prev }; delete n[code]; return n; });
  };

  const savePrice = async (code: string, supplier: string) => {
    const value = parseFloat(editingCell[code] ?? '0') || 0;
    setSavingCell(code);
    try {
      await fetch('/api/price-save.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          product_category: selectedCat,
          code,
          price_per_meter: value,
          supplier,
        }),
      });
      setPrices((prev) =>
        prev.map((p) => p.code === code ? { ...p, price_per_meter: value } : p)
      );
      setEditingCell((prev) => { const n = { ...prev }; delete n[code]; return n; });
    } catch { /* ignore */ }
    finally { setSavingCell(null); }
  };

  if (loading) return <p className="text-gray-400">Cargando…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Precios por metro</h1>
        <p className="text-xs text-gray-500 mt-1">
          Precios actualizados al 29/01/2026. Cálculo: $/metro × metros/envase × cantidad
        </p>
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Categoría:</label>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {products.map((p) => (
            <option key={p.category} value={p.category}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Prices table */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-32">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-32">Proveedor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">$/metro</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingPrices ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">
                  Cargando precios…
                </td>
              </tr>
            ) : prices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">
                  Sin precios para esta categoría
                </td>
              </tr>
            ) : (
              prices.map((row) => {
                const isEditing = row.code in editingCell;
                const isSaving  = savingCell === row.code;

                return (
                  <tr key={row.code} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-800">{row.code}</td>
                    <td className="px-4 py-2">
                      {row.supplier && (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${supplierBadge(row.supplier)}`}>
                          {row.supplier}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={editingCell[row.code]}
                            onChange={(e) =>
                              setEditingCell((prev) => ({ ...prev, [row.code]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')  savePrice(row.code, row.supplier);
                              if (e.key === 'Escape') cancelEdit(row.code);
                            }}
                            autoFocus
                            className="w-32 border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => savePrice(row.code, row.supplier)}
                            disabled={isSaving}
                            className="px-2 py-0.5 bg-black text-white text-xs rounded disabled:opacity-40"
                          >
                            {isSaving ? '…' : '✓'}
                          </button>
                          <button
                            onClick={() => cancelEdit(row.code)}
                            className="px-2 py-0.5 border border-gray-300 text-xs rounded hover:bg-gray-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(row.code, row.price_per_meter)}
                          className="text-left text-xs px-2 py-1 rounded hover:bg-gray-100 w-full text-gray-800"
                        >
                          {row.price_per_meter > 0 ? formatARS(row.price_per_meter) : '— sin precio'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(row.code, row.price_per_meter)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-gray-400">
        Canal mayorista (WhatsApp): pedidos que superen <strong>$3.000.000 ARS</strong>
      </p>
    </div>
  );
}
