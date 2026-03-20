'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type DBProduct = {
  id: number;
  product_code: string;
  name: string;
  description: string;
  category: string;
  slug: string | null;
  use_text: string | null;
  images: string;
  codes: string;
  colors: string;
  presentation: string;
  technical_specs: string;
};

type FormState = {
  product_code:    string;
  name:            string;
  description:     string;
  category:        string;
  slug:            string;
  use_text:        string;
  // arrays stored as "one item per line" in textareas
  codes:           string;
  colors:          string;
  presentation:    string;
  technical_specs: string;
  // images as raw JSON (can be strings or objects)
  images:          string;
};

type TechnicalFile = {
  id: number;
  label: string;
  url: string;
};

const EMPTY_FORM: FormState = {
  product_code:    '',
  name:            '',
  description:     '',
  category:        '',
  slug:            '',
  use_text:        '',
  codes:           '',
  colors:          '',
  presentation:    '',
  technical_specs: '',
  images:          '[]',
};

/** Parse a JSON array string into one-item-per-line text */
function arrayToLines(json: string): string {
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return json;
    return arr.map((item) =>
      typeof item === 'string' ? item : JSON.stringify(item)
    ).join('\n');
  } catch {
    return json;
  }
}

/** Convert one-item-per-line text back to JSON array string */
function linesToArray(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const arr = lines.map((line) => {
    try {
      const parsed = JSON.parse(line);
      // Only treat as JSON if it's an object (not a bare number/boolean)
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch { /* fall through */ }
    return line;
  });
  return JSON.stringify(arr);
}

function productToForm(p: DBProduct): FormState {
  return {
    product_code:    p.product_code,
    name:            p.name,
    description:     p.description,
    category:        p.category,
    slug:            p.slug ?? '',
    use_text:        p.use_text ?? '',
    codes:           arrayToLines(p.codes),
    colors:          arrayToLines(p.colors),
    presentation:    arrayToLines(p.presentation),
    technical_specs: arrayToLines(p.technical_specs),
    images:          p.images,
  };
}

export default function ProductEditForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const editId       = searchParams.get('id');
  const isEdit       = editId !== null;

  const [form,    setForm]    = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // ── Technical files state ─────────────────────────────────────────────────
  const [files,       setFiles]       = useState<TechnicalFile[]>([]);
  const [fileLabel,   setFileLabel]   = useState('');
  const [fileInput,   setFileInput]   = useState<File | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing product when editing
  useEffect(() => {
    if (!isEdit) return;

    fetch('/api/products.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: DBProduct[]) => {
        const product = data.find((p) => p.id === Number(editId));
        if (!product) {
          setError('Producto no encontrado');
          return;
        }
        setForm(productToForm(product));
      })
      .catch(() => setError('Error al cargar el producto'))
      .finally(() => setLoading(false));
  }, [editId, isEdit]);

  // Load files when we have the category
  useEffect(() => {
    if (!isEdit || !form.category) return;
    fetch(`/api/product-files.php?category=${encodeURIComponent(form.category)}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((data: TechnicalFile[]) => setFiles(data))
      .catch(() => {/* ignore */});
  }, [isEdit, form.category]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const body = {
      ...(isEdit && { id: Number(editId) }),
      product_code:    form.product_code,
      name:            form.name,
      description:     form.description,
      category:        form.category,
      slug:            form.slug,
      use_text:        form.use_text,
      images:          form.images,
      codes:           linesToArray(form.codes),
      colors:          linesToArray(form.colors),
      presentation:    linesToArray(form.presentation),
      technical_specs: linesToArray(form.technical_specs),
    };

    const endpoint = isEdit ? '/api/product-update.php' : '/api/product-create.php';

    try {
      const res  = await fetch(endpoint, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Error al guardar');
        return;
      }

      router.push('/admin/products');
    } catch {
      setError('Error de red');
    } finally {
      setSaving(false);
    }
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInput || !fileLabel.trim()) return;
    setUploadError('');
    setUploading(true);

    const fd = new FormData();
    fd.append('category', form.category);
    fd.append('label',    fileLabel.trim());
    fd.append('file',     fileInput);

    try {
      const res  = await fetch('/api/upload-file.php', {
        method:      'POST',
        credentials: 'include',
        body:        fd,
      });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error ?? 'Error al subir'); return; }
      setFiles((prev) => [...prev, { id: data.id, label: fileLabel.trim(), url: data.url }]);
      setFileLabel('');
      setFileInput(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setUploadError('Error de conexión');
    } finally {
      setUploading(false);
    }
  };

  // ── File delete ───────────────────────────────────────────────────────────
  const handleDeleteFile = async (id: number) => {
    try {
      const res = await fetch('/api/file-delete.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ id }),
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {/* ignore */}
  };

  if (loading) return <p className="text-gray-400">Cargando producto…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </div>

      {error && (
        <p className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 text-sm mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Información básica</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Código de producto" required>
              <input
                type="text"
                value={form.product_code}
                onChange={set('product_code')}
                placeholder="SU001"
                className={inputCls}
              />
            </Field>
            <Field label="Categoría (slug de ruta)" required>
              <input
                type="text"
                value={form.category}
                onChange={set('category')}
                placeholder="subterraneos"
                className={inputCls}
                required
              />
            </Field>
          </div>

          <Field label="Nombre" required>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="SUBTERRÁNEOS"
              className={inputCls}
              required
            />
          </Field>

          <Field label="Descripción" required>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              className={inputCls}
              required
            />
          </Field>

          <Field label="Texto de uso (opcional)">
            <input
              type="text"
              value={form.use_text}
              onChange={set('use_text')}
              placeholder="Uso: instalaciones eléctricas..."
              className={inputCls}
            />
          </Field>

          <Field label="Slug (opcional)">
            <input
              type="text"
              value={form.slug}
              onChange={set('slug')}
              className={inputCls}
            />
          </Field>
        </section>

        {/* Arrays */}
        <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Variantes (un valor por línea)</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Códigos / Secciones">
              <textarea
                value={form.codes}
                onChange={set('codes')}
                rows={5}
                placeholder={"S16\nS25\nS35"}
                className={inputCls + ' font-mono text-xs'}
              />
            </Field>

            <Field label="Colores">
              <textarea
                value={form.colors}
                onChange={set('colors')}
                rows={5}
                placeholder={"Rojo\nAzul\nNegro"}
                className={inputCls + ' font-mono text-xs'}
              />
            </Field>

            <Field label="Presentación">
              <textarea
                value={form.presentation}
                onChange={set('presentation')}
                rows={5}
                placeholder={"Bobina: 1000 mts\nRollo: 100 mts"}
                className={inputCls + ' font-mono text-xs'}
              />
            </Field>

            <Field label="Especificaciones técnicas">
              <textarea
                value={form.technical_specs}
                onChange={set('technical_specs')}
                rows={5}
                placeholder={"Tensión de servicio: 0.6/1 KV\nAislamiento: PVC"}
                className={inputCls + ' font-mono text-xs'}
              />
            </Field>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-2">
          <h2 className="font-semibold text-gray-800">Imágenes (JSON)</h2>
          <p className="text-xs text-gray-500">
            Array JSON. Cada elemento es una ruta (<code>&quot;/assets/...jpg&quot;</code>) o un
            objeto (<code>{`{"url":"/assets/...jpg","label":"ET-VT-009"}`}</code>).
          </p>
          <textarea
            value={form.images}
            onChange={set('images')}
            rows={6}
            className={inputCls + ' font-mono text-xs'}
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2 rounded text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <Link href="/admin/products" className="text-gray-500 text-sm hover:underline">
            Cancelar
          </Link>
        </div>
      </form>

      {/* ── Fichas técnicas (PDF) — only when editing ── */}
      {isEdit && form.category && (
        <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 mt-6">
          <h2 className="font-semibold text-gray-800">Fichas técnicas (PDF)</h2>

          {/* Existing files */}
          {files.length > 0 ? (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:underline truncate"
                  >
                    {f.label}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(f.id)}
                    className="shrink-0 px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Sin fichas cargadas.</p>
          )}

          {/* Upload form */}
          <form onSubmit={handleUpload} className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-medium text-gray-600">Agregar ficha técnica</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                <input
                  type="text"
                  value={fileLabel}
                  onChange={(e) => setFileLabel(e.target.value)}
                  placeholder="Ficha técnica VT-009"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Archivo PDF</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFileInput(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  required
                />
              </div>
            </div>
            {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
            <button
              type="submit"
              disabled={uploading || !fileInput || !fileLabel.trim()}
              className="px-4 py-2 bg-black text-white text-xs rounded hover:bg-gray-800 disabled:opacity-40"
            >
              {uploading ? 'Subiendo…' : 'Subir PDF'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

// ─── helpers ───────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
