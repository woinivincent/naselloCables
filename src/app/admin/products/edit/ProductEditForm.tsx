'use client';

import { useEffect, useState } from 'react';
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
