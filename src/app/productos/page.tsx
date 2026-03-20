'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import rawCatalog from "@/data/cable_catalog.json";

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

type ProductListing = {
  id: string;   // route slug (category)
  name: string;
  image: string;
};

type CatalogEntry = {
  name: string;
  images: (string | { url: string; label?: string })[];
};

function firstImage(images: (string | { url: string; label?: string })[]): string {
  if (!Array.isArray(images) || images.length === 0) return '/placeholder.png';
  // Prefer plain string images (product photos); labeled objects are ET technical sheets
  const str = images.find((img) => typeof img === 'string');
  return typeof str === 'string' ? str : '/placeholder.png';
}

function buildFromJSON(): ProductListing[] {
  const catalog = rawCatalog as { cable_catalog: Record<string, CatalogEntry> };
  return Object.entries(catalog.cable_catalog).map(([id, entry]) => ({
    id,
    name: entry.name,
    image: firstImage(entry.images),
  }));
}

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductListing[]>(buildFromJSON);

  useEffect(() => {
    fetch('/api/products.php')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data: DBProduct[]) => {
        setProducts(
          data.map((p) => ({
            id: p.category,
            name: p.name,
            image: firstImage(JSON.parse(p.images)),
          }))
        );
      })
      .catch(() => {}); // already initialized from JSON
  }, []);

  return (
    <div className="flex justify-center">
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="mb-9 text-center text-3xl sm:text-4xl font-bold">NUESTROS PRODUCTOS</h1>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(({ id, name, image }) => (
            <Link href={`/productos/${id}`} key={id}>
              <div className="overflow-hidden transition-all hover:scale-[1.05] group">
                <div className="bg-[#f0f0f0] overflow-hidden rounded-tr-[40px] relative">
                  <div className="relative aspect-[1.05] w-full">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-fill"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 32vw, 30vw"
                      quality={90}
                    />
                  </div>

                  <div className="absolute bottom-3 sm:bottom-5 w-full h-8 bg-white px-3 py-1 flex items-center justify-between">
                    <span className="font-bold text-black text-xs sm:text-sm md:text-base truncate pr-2">{name}</span>
                    <div className="w-6 h-6 rounded-full border border-primary bg-primary flex items-center justify-center flex-shrink-0">
                      <Plus className="text-white w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
