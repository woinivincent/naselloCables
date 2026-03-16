import { notFound } from "next/navigation";
import { BackButtonClient } from './BackButtonClient';
import { ProductPageClient } from './ProductPageClient';

import rawCatalog from "@/data/cable_catalog.json";

const catalog = rawCatalog as {
  cable_catalog: { [key: string]: unknown };
};

export async function generateStaticParams() {
  return Object.keys(catalog.cable_catalog).map((id) => ({ id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const keys = Object.keys(catalog.cable_catalog);
  const { id } = params;

  if (!keys.includes(id)) return notFound();

  const index = keys.indexOf(id);
  const nextId = keys[(index + 1) % keys.length];
  const prevId = keys[(index - 1 + keys.length) % keys.length];

  return (
    <div>
      <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:ml-[100px] lg:px-0 max-sm:hidden">
        <BackButtonClient />
      </div>

      <ProductPageClient id={id} nextId={nextId} prevId={prevId} />
    </div>
  );
}
