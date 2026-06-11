'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { parseCatalogFile, type ParsedRow } from '@/lib/catalogParser';

type Catalog = {
  id: number;
  name: string;
  supplier: string;
  file_url: string | null;
  items_count: number;
  imported_at: string | null;
  created_at: string;
};

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

type PreviewRow = ParsedRow & {
  category: string;  // product_category asignada ('' = sin asignar)
  include: boolean;
};

const SUPPLIERS = ['Nasello', 'Wireflex', 'Conduelec'];

const formatARS = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// Same normalization used by calculate-order.php: UPPER + comma→dot
const normCode = (code: string) => code.toUpperCase().replace(/,/g, '.');

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [prices,   setPrices]   = useState<ProductPrice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Create form
  const [showCreate,  setShowCreate]  = useState(false);
  const [createName,  setCreateName]  = useState('');
  const [createSupp,  setCreateSupp]  = useState(SUPPLIERS[0]);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState('');

  // Inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName,  setEditName]  = useState('');
  const [editSupp,  setEditSupp]  = useState('');

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Import flow
  const [importCatalog, setImportCatalog] = useState<Catalog | null>(null);
  const [importFile,    setImportFile]    = useState<File | null>(null);
  const [previewRows,   setPreviewRows]   = useState<PreviewRow[]>([]);
  const [parsing,       setParsing]       = useState(false);
  const [importing,     setImporting]     = useState(false);
  const [importError,   setImportError]   = useState('');
  const [importOk,      setImportOk]      = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCatalogs = () =>
    fetch('/api/catalogs.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Catalog[]) => setCatalogs(Array.isArray(data) ? data : []));

  useEffect(() => {
    Promise.all([
      loadCatalogs(),
      fetch('/api/products.php', { credentials: 'include' })
        .then((r) => r.json())
        .then((data: DBProduct[]) => setProducts(data.map((p) => ({ id: p.id, name: p.name, category: p.category })))),
      fetch('/api/product-prices.php', { credentials: 'include' })
        .then((r) => r.json())
        .then((data: ProductPrice[]) => setPrices(Array.isArray(data) ? data : [])),
    ])
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  // Map UPPER(code) → categories where it already exists (used to auto-assign on import)
  const codeIndex = useMemo(() => {
    const map = new Map<string, { category: string; supplier: string }[]>();
    for (const p of prices) {
      const key = normCode(p.code);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ category: p.product_category, supplier: p.supplier });
    }
    return map;
  }, [prices]);

  const categoryName = (slug: string) =>
    products.find((p) => p.category === slug)?.name ?? slug;

  // ── Create / edit / delete ──────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res  = await fetch('/api/catalog-create.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ name: createName, supplier: createSupp }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? 'Error'); return; }
      setShowCreate(false);
      setCreateName('');
      setCreateSupp(SUPPLIERS[0]);
      loadCatalogs();
    } catch {
      setCreateError('Error de conexión');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    await fetch('/api/catalog-update.php', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ id, name: editName, supplier: editSupp }),
    });
    setEditingId(null);
    loadCatalogs();
  };

  const handleDelete = async (id: number) => {
    await fetch('/api/catalog-delete.php', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ id }),
    });
    setDeletingId(null);
    loadCatalogs();
  };

  // ── Import flow ─────────────────────────────────────────────────────────────

  const startImport = (catalog: Catalog) => {
    setImportCatalog(catalog);
    setImportFile(null);
    setPreviewRows([]);
    setImportError('');
    setImportOk('');
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file || !importCatalog) return;

    setImportFile(file);
    setParsing(true);
    setImportError('');
    try {
      const rows = await parseCatalogFile(file);
      if (rows.length === 0) {
        setImportError('No se detectaron códigos con precio en el archivo. Verificá el formato.');
        setImportFile(null);
        return;
      }
      // Auto-assign category: prefer codes already loaded for this supplier,
      // otherwise any category where the code is unique.
      const supplier = importCatalog.supplier;
      setPreviewRows(rows.map((r) => {
        const matches  = codeIndex.get(normCode(r.code)) ?? [];
        const own      = Array.from(new Set(matches.filter((m) => m.supplier === supplier).map((m) => m.category)));
        const anyCat   = Array.from(new Set(matches.map((m) => m.category)));
        const category = own.length === 1 ? own[0] : anyCat.length === 1 ? anyCat[0] : '';
        return { ...r, category, include: true };
      }));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'No se pudo leer el archivo');
      setImportFile(null);
    } finally {
      setParsing(false);
    }
  };

  const updatePreviewRow = (idx: number, data: Partial<PreviewRow>) =>
    setPreviewRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...data } : r)));

  const cancelImport = () => {
    setImportCatalog(null);
    setImportFile(null);
    setPreviewRows([]);
    setImportError('');
  };

  const readyRows   = previewRows.filter((r) => r.include && r.category !== '');
  const skippedRows = previewRows.filter((r) => r.include && r.category === '');

  const confirmImport = async () => {
    if (!importCatalog || !importFile || readyRows.length === 0) return;
    setImporting(true);
    setImportError('');
    try {
      // 1. Store the source file on the server (stable link per catalog)
      const fd = new FormData();
      fd.append('id', String(importCatalog.id));
      fd.append('file', importFile);
      const upRes  = await fetch('/api/catalog-upload.php', { method: 'POST', credentials: 'include', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) { setImportError(upData.error ?? 'Error al subir el archivo'); return; }

      // 2. Apply parsed prices to product_prices
      const impRes  = await fetch('/api/catalog-import.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          id:    importCatalog.id,
          items: readyRows.map((r) => ({
            product_category: r.category,
            code:             r.code,
            price_per_meter:  r.price,
          })),
        }),
      });
      const impData = await impRes.json();
      if (!impRes.ok) { setImportError(impData.error ?? 'Error al importar'); return; }

      setImportOk(`Se importaron ${impData.applied} precios de "${importCatalog.name}".`);
      setImportCatalog(null);
      setImportFile(null);
      setPreviewRows([]);
      // Refresh catalogs and the price index for future imports
      loadCatalogs();
      fetch('/api/product-prices.php', { credentials: 'include' })
        .then((r) => r.json())
        .then((data: ProductPrice[]) => setPrices(Array.isArray(data) ? data : []));
    } catch {
      setImportError('Error de conexión');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <p className="text-gray-400">Cargando…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catálogos de precios</h1>
          <p className="text-xs text-gray-500 mt-1">
            Listas de precios de proveedores. Al importar un archivo (PDF, Excel o CSV) se
            actualizan los precios por metro usados en el cálculo de pedidos.
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
        >
          {showCreate ? 'Cancelar' : '+ Nuevo catálogo'}
        </button>
      </div>

      {importOk && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2">{importOk}</p>
      )}

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Ej: Lista Conduelec Junio 2026"
              required
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
            <select
              value={createSupp}
              onChange={(e) => setCreateSupp(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-1.5 bg-black text-white text-sm rounded disabled:opacity-50"
          >
            {creating ? 'Creando…' : 'Crear'}
          </button>
          {createError && <p className="text-sm text-red-600">{createError}</p>}
        </form>
      )}

      {/* Hidden file input shared by all "Importar" buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.csv"
        onChange={handleFileChosen}
        className="hidden"
      />

      {/* Catalogs table */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Proveedor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Archivo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Última import.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">Filas</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-64">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {catalogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-xs">
                  Sin catálogos. Creá uno para importar una lista de precios.
                </td>
              </tr>
            ) : (
              catalogs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {editingId === c.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <span className="text-gray-800">{c.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === c.id ? (
                      <select
                        value={editSupp}
                        onChange={(e) => setEditSupp(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        {SUPPLIERS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-700">{c.supplier}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {c.file_url ? (
                      <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Ver
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">{formatDate(c.imported_at)}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{c.items_count > 0 ? c.items_count : '—'}</td>
                  <td className="px-4 py-2 text-xs space-x-3 whitespace-nowrap">
                    {editingId === c.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(c.id)} className="text-green-700 hover:underline">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancelar</button>
                      </>
                    ) : deletingId === c.id ? (
                      <>
                        <span className="text-gray-600">¿Eliminar?</span>
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Sí</button>
                        <button onClick={() => setDeletingId(null)} className="text-gray-500 hover:underline">No</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startImport(c)} className="text-blue-600 hover:underline font-medium">
                          {c.file_url ? 'Reemplazar e importar' : 'Subir e importar'}
                        </button>
                        <button
                          onClick={() => { setEditingId(c.id); setEditName(c.name); setEditSupp(c.supplier); }}
                          className="text-gray-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button onClick={() => setDeletingId(c.id)} className="text-red-600 hover:underline">Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {parsing && <p className="text-sm text-gray-500">Leyendo archivo…</p>}
      {importError && <p className="text-sm text-red-600">{importError}</p>}

      {/* Import preview */}
      {importCatalog && previewRows.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-gray-800">
                Vista previa — {importCatalog.name} ({importCatalog.supplier})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {previewRows.length} filas detectadas en <span className="font-mono">{importFile?.name}</span>.
                Revisá los precios y la categoría de cada código antes de confirmar.
                {skippedRows.length > 0 && (
                  <span className="text-amber-600"> {skippedRows.length} filas sin categoría no se importarán.</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmImport}
                disabled={importing || readyRows.length === 0}
                className="px-4 py-1.5 bg-black text-white text-sm rounded disabled:opacity-50"
              >
                {importing ? 'Importando…' : `Confirmar importación (${readyRows.length})`}
              </button>
              <button
                onClick={cancelImport}
                disabled={importing}
                className="px-4 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-12"></th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-36">Código</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-36">$/metro</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Categoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className={row.include ? '' : 'opacity-40'}>
                    <td className="px-4 py-1.5">
                      <input
                        type="checkbox"
                        checked={row.include}
                        onChange={(e) => updatePreviewRow(idx, { include: e.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-1.5 font-mono text-xs text-gray-800">{row.code}</td>
                    <td className="px-4 py-1.5 text-xs">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.price}
                        onChange={(e) => updatePreviewRow(idx, { price: parseFloat(e.target.value) || 0 })}
                        className="w-28 border border-gray-300 rounded px-2 py-0.5 text-xs"
                      />
                      <span className="ml-2 text-gray-400">{formatARS(row.price)}</span>
                    </td>
                    <td className="px-4 py-1.5">
                      <select
                        value={row.category}
                        onChange={(e) => updatePreviewRow(idx, { category: e.target.value })}
                        className={`border rounded px-2 py-0.5 text-xs ${row.category === '' && row.include ? 'border-amber-400 bg-amber-50' : 'border-gray-300'}`}
                      >
                        <option value="">— sin asignar —</option>
                        {products.map((p) => (
                          <option key={p.category} value={p.category}>{categoryName(p.category)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
