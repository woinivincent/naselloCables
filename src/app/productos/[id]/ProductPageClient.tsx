'use client';

import { useEffect, useState } from 'react';
import Carousel from '@/components/Carousel';
import { ProductDetails } from './ProductDetails';
import { ProductNavigationClient } from './ProductNavigationClient';
import rawCatalog from '@/data/cable_catalog.json';

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

type Product = {
  id: string;
  name: string;
  description: string;
  images: (string | { url: string; label?: string })[];
  codes: string[];
  colors: string[];
  presentation: string[];
  technical_specs: string[] | string;
  use: string | null;
};

function mapDBProduct(db: DBProduct): Product {
  return {
    id: db.category,
    name: db.name,
    description: db.description,
    use: db.use_text,
    images: JSON.parse(db.images),
    codes: JSON.parse(db.codes),
    colors: JSON.parse(db.colors),
    presentation: JSON.parse(db.presentation),
    technical_specs: JSON.parse(db.technical_specs),
  };
}

type CatalogEntry = {
  name: string;
  description: string;
  use?: string;
  images: (string | { url: string; label?: string })[];
  codes: string[];
  colors: string[];
  presentation: string[];
  technical_specs: string[] | string;
};

function mapCatalogEntry(id: string, entry: CatalogEntry): Product {
  return {
    id,
    name: entry.name,
    description: entry.description,
    use: entry.use ?? null,
    images: entry.images,
    codes: entry.codes,
    colors: entry.colors,
    presentation: entry.presentation,
    technical_specs: entry.technical_specs,
  };
}

type Props = {
  id: string;
  nextId: string;
  prevId: string;
};

export function ProductPageClient({ id, nextId, prevId }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/products.php')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data: DBProduct[]) => {
        const match = data.find((p) => p.category === id);
        if (!match) throw new Error('product not found');
        setProduct(mapDBProduct(match));
      })
      .catch(() => {
        // API unavailable — fall back to local JSON catalog
        const catalog = rawCatalog as {
          cable_catalog: { [key: string]: CatalogEntry };
        };
        const entry = catalog.cable_catalog[id];
        if (!entry) { setError(true); return; }
        setProduct(mapCatalogEntry(id, entry));
      });
  }, [id]);

  if (error) {
    return (
      <p className="text-center py-16 text-red-500">
        Producto no encontrado.
      </p>
    );
  }

  if (!product) {
    return (
      <p className="text-center py-16 text-gray-400">Cargando...</p>
    );
  }

  // Exclude ET-labeled technical reference images from the carousel
  const carouselImages = product.images.filter(
    (img) =>
      typeof img === 'string' ||
      (typeof img === 'object' && (!img.label || !img.url))
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Carousel images={carouselImages} productName={product.name} />
        <ProductDetails product={product} />
      </div>
      <ProductNavigationClient nextId={nextId} prevId={prevId} />
    </main>
  );
}
