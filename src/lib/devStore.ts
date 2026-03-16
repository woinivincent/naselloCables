// DEV ONLY — in-memory product store for local API route mocks.
// Initialized from cable_catalog.json so the admin panel has real data to work with.
// Changes persist for the lifetime of the dev server process (lost on restart).

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

type CatalogEntry = {
  id?: string;
  name: string;
  description: string;
  use?: string;
  slug?: string;
  images: unknown;
  codes: unknown;
  colors: unknown;
  presentation: unknown;
  technical_specs: unknown;
};

function initFromJSON(): DBProduct[] {
  const catalog = rawCatalog as { cable_catalog: Record<string, CatalogEntry> };
  return Object.entries(catalog.cable_catalog).map(([category, entry], index) => ({
    id:              index + 1,
    product_code:    entry.id ?? category.toUpperCase().slice(0, 5),
    name:            entry.name,
    description:     entry.description,
    category,
    slug:            entry.slug ?? null,
    use_text:        entry.use ?? null,
    images:          JSON.stringify(entry.images ?? []),
    codes:           JSON.stringify(entry.codes ?? []),
    colors:          JSON.stringify(entry.colors ?? []),
    presentation:    JSON.stringify(entry.presentation ?? []),
    technical_specs: JSON.stringify(entry.technical_specs ?? []),
  }));
}

// Module-level singleton — survives across requests within the same process
const products: DBProduct[] = initFromJSON();
let nextId = products.length + 1;

export const devStore = {
  getAll: (): DBProduct[] => [...products],

  findById: (id: number): DBProduct | undefined =>
    products.find((p) => p.id === id),

  findByCategory: (category: string): DBProduct | undefined =>
    products.find((p) => p.category === category),

  create: (data: Partial<DBProduct>): number => {
    const id = nextId++;
    products.push({
      id,
      product_code:    data.product_code    ?? '',
      name:            data.name            ?? '',
      description:     data.description     ?? '',
      category:        data.category        ?? '',
      slug:            data.slug            ?? null,
      use_text:        data.use_text        ?? null,
      images:          data.images          ?? '[]',
      codes:           data.codes           ?? '[]',
      colors:          data.colors          ?? '[]',
      presentation:    data.presentation    ?? '[]',
      technical_specs: data.technical_specs ?? '[]',
    });
    return id;
  },

  update: (id: number, data: Partial<DBProduct>): boolean => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products[idx] = {
      ...products[idx],
      product_code:    data.product_code    ?? products[idx].product_code,
      name:            data.name            ?? products[idx].name,
      description:     data.description     ?? products[idx].description,
      category:        data.category        ?? products[idx].category,
      slug:            data.slug            ?? products[idx].slug,
      use_text:        data.use_text        ?? products[idx].use_text,
      images:          data.images          ?? products[idx].images,
      codes:           data.codes           ?? products[idx].codes,
      colors:          data.colors          ?? products[idx].colors,
      presentation:    data.presentation    ?? products[idx].presentation,
      technical_specs: data.technical_specs ?? products[idx].technical_specs,
    };
    return true;
  },

  remove: (id: number): boolean => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },
};
