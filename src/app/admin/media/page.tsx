'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, RefreshCw } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'logos' | 'productos' | 'general';

type DBProduct = {
  id: number;
  product_code: string;
  name: string;
  description: string;
  category: string;
  slug: string | null;
  use_text: string | null;
  images: string;        // JSON string
  codes: string;
  colors: string;
  presentation: string;
  technical_specs: string;
};

type ImageItem = {
  label: string;
  /** path relative to /assets/ (e.g. "logo.png" or "productos/Subterraneo-01.jpg") */
  path: string;
};

// ── Static datasets ───────────────────────────────────────────────────────────

const LOGOS: ImageItem[] = [
  { label: 'Logo navbar',  path: 'logo.png' },
  { label: 'Logo footer',  path: 'Logo-Nasello_negativo.png' },
];

const GENERAL_SECTIONS: { section: string; items: ImageItem[] }[] = [
  {
    section: 'Home — slider',
    items: [
      { label: 'Slider acometida',    path: 'slider_acometida.jpg' },
      { label: 'Slider fotovoltaico', path: 'slider_fotovoltaico.jpg' },
      { label: 'Slider laboratorio',  path: 'slider_laboratorio.jpg' },
    ],
  },
  {
    section: 'Home — destacados',
    items: [
      { label: 'Destacado soldadura',   path: 'imagen-home-destacado_soldadura.jpg' },
      { label: 'Destacado subterráneo', path: 'imagen-home-destacado_subterraneo.jpg' },
      { label: 'Destacado unipolares',  path: 'imagen-home-destacado_unipolares.jpg' },
      { label: 'Fotovoltaico home',     path: 'imagen-home-fotovoltaico.jpg' },
      { label: 'Imagen celeste home',   path: 'imagen-home-celeste.jpg' },
      { label: 'Fondo home',            path: 'fondo-home.jpg' },
    ],
  },
  {
    section: 'Empresa',
    items: [
      { label: 'Encabezado empresa',  path: 'imagen-encabezado-empresa.jpg' },
      { label: 'Foto empresa 1',      path: 'foto-empresa-1.jpg' },
      { label: 'Foto empresa 2',      path: 'foto-empresa-2.jpg' },
      { label: 'Foto empresa 3',      path: 'foto-empresa-3.jpg' },
    ],
  },
  {
    section: 'Calidad',
    items: [
      { label: 'Encabezado calidad',    path: 'imagen-encabezado-calidad.jpg' },
      { label: 'Foto calidad 1',        path: 'foto_calidad-1.jpg' },
      { label: 'Foto calidad 2',        path: 'foto_calidad-2.jpg' },
      { label: 'Foto calidad 3',        path: 'foto_calidad-3.jpg' },
      { label: 'Foto derecha calidad',  path: 'foto_derecha-calidad.jpg' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseImages(raw: string): string[] {
  try {
    const arr = JSON.parse(raw) as (string | { url: string; label?: string })[];
    return arr
      .map((x) => (typeof x === 'string' ? x : x.url))
      .filter((u) => u.startsWith('/assets/'));
  } catch {
    return [];
  }
}

function updateImagesJson(raw: string, newUrls: string[]): string {
  try {
    const arr = JSON.parse(raw) as (string | { url: string; label?: string })[];
    // Keep labeled objects (ET sheets), replace plain string images
    const labeled = arr.filter((x) => typeof x !== 'string' && 'label' in x && x.label);
    return JSON.stringify([...newUrls, ...labeled]);
  } catch {
    return JSON.stringify(newUrls);
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ImagePreviewCard({
  src,
  label,
  onReplace,
  onDelete,
  loading,
}: {
  src: string;
  label: string;
  onReplace?: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={src}
          alt={label}
          fill
          className="object-contain p-2"
          unoptimized
          key={src} // re-mount when URL changes (cache-bust)
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <span className="text-sm text-gray-700 truncate flex-1">{label}</span>
        <div className="flex gap-1 flex-shrink-0">
          {onReplace && (
            <>
              <button
                onClick={() => inputRef.current?.click()}
                className="p-1.5 rounded hover:bg-blue-50 text-blue-600 border border-blue-200"
                title="Reemplazar"
                disabled={loading}
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onReplace(f).then(() => { e.target.value = ''; });
                }}
              />
            </>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-red-50 text-red-500 border border-red-200"
              title="Eliminar"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [tab, setTab]   = useState<Tab>('logos');

  // ── Logos tab state
  const [logoLoading, setLogoLoading] = useState<Record<string, boolean>>({});
  const [logoSrcs,    setLogoSrcs]    = useState<Record<string, string>>({
    'logo.png':                   `/assets/logo.png?t=${Date.now()}`,
    'Logo-Nasello_negativo.png':  `/assets/Logo-Nasello_negativo.png?t=${Date.now()}`,
  });
  const [logoMsg, setLogoMsg] = useState('');

  // ── Productos tab state
  const [products, setProducts]           = useState<DBProduct[]>([]);
  const [selectedCat, setSelectedCat]     = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [prodLoading, setProdLoading]     = useState(false);
  const [uploadingProd, setUploadingProd] = useState(false);
  const [prodMsg, setProdMsg]             = useState('');
  const prodUploadRef = useRef<HTMLInputElement>(null);

  // ── General tab state
  const [generalLoading, setGeneralLoading] = useState<Record<string, boolean>>({});
  const [generalSrcs,    setGeneralSrcs]    = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    GENERAL_SECTIONS.forEach((s) =>
      s.items.forEach((item) => { init[item.path] = `/assets/${item.path}?t=${Date.now()}`; })
    );
    return init;
  });
  const [generalMsg, setGeneralMsg] = useState('');

  // Load products on mount
  useEffect(() => {
    fetch('/api/products.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: DBProduct[]) => setProducts(data))
      .catch(() => {});
  }, []);

  // Update productImages when category changes
  useEffect(() => {
    if (!selectedCat) { setProductImages([]); return; }
    const p = products.find((x) => x.category === selectedCat);
    setProductImages(p ? parseImages(p.images) : []);
  }, [selectedCat, products]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  async function uploadAndReplace(relPath: string, file: File, subfolder: 'logos' | 'productos' | 'general') {
    const fd = new FormData();
    fd.append('subfolder',    subfolder);
    fd.append('replace_path', relPath);
    fd.append('file',         file);
    const r   = await fetch('/api/upload-image.php', { method: 'POST', body: fd, credentials: 'include' });
    const res = await r.json() as { ok?: boolean; url?: string; error?: string };
    if (!res.ok) throw new Error(res.error ?? 'Error al subir');
    return res.url as string;
  }

  async function updateProductImages(newImages: string[]) {
    const p = products.find((x) => x.category === selectedCat);
    if (!p) return;
    const body = { ...p, images: updateImagesJson(p.images, newImages) };
    const r = await fetch('/api/product-update.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('Error al actualizar producto');
    // Refresh local products state
    setProducts((prev) =>
      prev.map((x) => x.id === p.id ? { ...x, images: body.images } : x)
    );
  }

  // ── Logo handlers ──────────────────────────────────────────────────────────

  async function handleLogoReplace(item: ImageItem, file: File) {
    setLogoLoading((prev) => ({ ...prev, [item.path]: true }));
    setLogoMsg('');
    try {
      await uploadAndReplace(item.path, file, 'logos');
      setLogoSrcs((prev) => ({ ...prev, [item.path]: `/assets/${item.path}?t=${Date.now()}` }));
      setLogoMsg('Logo actualizado correctamente.');
    } catch (e: unknown) {
      setLogoMsg((e instanceof Error ? e.message : 'Error al actualizar logo'));
    } finally {
      setLogoLoading((prev) => ({ ...prev, [item.path]: false }));
    }
  }

  // ── Productos handlers ─────────────────────────────────────────────────────

  async function handleProductUpload(file: File) {
    setUploadingProd(true);
    setProdMsg('');
    try {
      const fd = new FormData();
      fd.append('subfolder', 'productos');
      fd.append('file',      file);
      const r   = await fetch('/api/upload-image.php', { method: 'POST', body: fd, credentials: 'include' });
      const res = await r.json() as { ok?: boolean; url?: string; error?: string };
      if (!res.ok) throw new Error(res.error ?? 'Error al subir');
      const newImages = [...productImages, res.url as string];
      await updateProductImages(newImages);
      setProductImages(newImages);
      setProdMsg('Imagen agregada correctamente.');
    } catch (e: unknown) {
      setProdMsg(e instanceof Error ? e.message : 'Error al subir imagen');
    } finally {
      setUploadingProd(false);
      if (prodUploadRef.current) prodUploadRef.current.value = '';
    }
  }

  async function handleProductDelete(url: string) {
    if (!confirm('¿Eliminar esta imagen del producto?')) return;
    setProdLoading(true);
    setProdMsg('');
    try {
      // Extract relative path under assets/
      const relPath = url.replace('/assets/', '');
      const r = await fetch('/api/image-delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ path: relPath }),
      });
      if (!r.ok) throw new Error('Error al eliminar imagen');
      const newImages = productImages.filter((u) => u !== url);
      await updateProductImages(newImages);
      setProductImages(newImages);
      setProdMsg('Imagen eliminada.');
    } catch (e: unknown) {
      setProdMsg(e instanceof Error ? e.message : 'Error al eliminar imagen');
    } finally {
      setProdLoading(false);
    }
  }

  // ── General handlers ───────────────────────────────────────────────────────

  async function handleGeneralReplace(item: ImageItem, file: File) {
    setGeneralLoading((prev) => ({ ...prev, [item.path]: true }));
    setGeneralMsg('');
    try {
      await uploadAndReplace(item.path, file, 'general');
      setGeneralSrcs((prev) => ({ ...prev, [item.path]: `/assets/${item.path}?t=${Date.now()}` }));
      setGeneralMsg(`"${item.label}" actualizada correctamente.`);
    } catch (e: unknown) {
      setGeneralMsg(e instanceof Error ? e.message : 'Error al actualizar imagen');
    } finally {
      setGeneralLoading((prev) => ({ ...prev, [item.path]: false }));
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
      tab === t
        ? 'border-[#009CDE] text-[#009CDE] bg-white'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de imágenes</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button className={tabCls('logos')}    onClick={() => setTab('logos')}>Logos</button>
        <button className={tabCls('productos')} onClick={() => setTab('productos')}>Productos</button>
        <button className={tabCls('general')}  onClick={() => setTab('general')}>General</button>
      </div>

      {/* ── TAB: LOGOS ──────────────────────────────────────────────────────── */}
      {tab === 'logos' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Reemplazá los logos del sitio. El archivo nuevo sobrescribe el existente (mismo nombre).
          </p>
          {logoMsg && (
            <div className={`mb-4 px-4 py-2 rounded text-sm ${logoMsg.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {logoMsg}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOGOS.map((item) => (
              <ImagePreviewCard
                key={item.path}
                src={logoSrcs[item.path]}
                label={item.label}
                loading={logoLoading[item.path]}
                onReplace={(file) => handleLogoReplace(item, file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: PRODUCTOS ──────────────────────────────────────────────────── */}
      {tab === 'productos' && (
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009CDE]"
            >
              <option value="">— Seleccionar producto —</option>
              {products.map((p) => (
                <option key={p.category} value={p.category}>{p.name}</option>
              ))}
            </select>

            {selectedCat && (
              <>
                <button
                  onClick={() => prodUploadRef.current?.click()}
                  disabled={uploadingProd || prodLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[#009CDE] text-white rounded hover:bg-[#0085c0] disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Agregar imagen
                </button>
                <input
                  ref={prodUploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProductUpload(f);
                  }}
                />
              </>
            )}
          </div>

          {prodMsg && (
            <div className={`mb-4 px-4 py-2 rounded text-sm ${prodMsg.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {prodMsg}
            </div>
          )}

          {!selectedCat && (
            <p className="text-sm text-gray-400 mt-6 text-center">Seleccioná un producto para ver sus imágenes.</p>
          )}

          {selectedCat && productImages.length === 0 && !prodLoading && (
            <p className="text-sm text-gray-400 mt-6 text-center">Este producto no tiene imágenes cargadas.</p>
          )}

          {selectedCat && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {productImages.map((url) => (
                <ImagePreviewCard
                  key={url}
                  src={`${url}?t=${Date.now()}`}
                  label={url.split('/').pop() ?? url}
                  loading={prodLoading}
                  onDelete={() => handleProductDelete(url)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: GENERAL ────────────────────────────────────────────────────── */}
      {tab === 'general' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Reemplazá imágenes del sitio. El archivo nuevo sobrescribe el existente.
          </p>
          {generalMsg && (
            <div className={`mb-4 px-4 py-2 rounded text-sm ${generalMsg.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {generalMsg}
            </div>
          )}
          {GENERAL_SECTIONS.map((sec) => (
            <div key={sec.section} className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">{sec.section}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sec.items.map((item) => (
                  <ImagePreviewCard
                    key={item.path}
                    src={generalSrcs[item.path]}
                    label={item.label}
                    loading={generalLoading[item.path]}
                    onReplace={(file) => handleGeneralReplace(item, file)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
