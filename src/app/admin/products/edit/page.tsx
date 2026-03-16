import { Suspense } from 'react';
import ProductEditForm from './ProductEditForm';

export default function ProductEditPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 p-6">Cargando…</p>}>
      <ProductEditForm />
    </Suspense>
  );
}
