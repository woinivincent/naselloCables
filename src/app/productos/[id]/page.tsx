import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/Carousel";
import { ProductDetails } from "./ProductDetails";
import { ProductNavigationClient } from "./ProductNavigationClient";
import { ArrowLeft } from "lucide-react";
import { BackButtonClient } from './BackButtonClient';

import rawCatalog from "@/data/cable_catalog.json";


const catalog = rawCatalog as {
  cable_catalog: {
    [key: string]: {
      id: string;
      name: string;
      description: string;
      images: (string | { url: string; label?: string })[];
      codes: string[];
      colors: string[];
      presentation: string[];
      technical_specs: string[] | string;
    };
  };
};

type Product = {
  id: string;
  name: string;
  description: string;
  images: (string | { url: string; label: string })[];
  codes: string[];
  colors: string[];
  presentation: string[];
  technical_specs: string[] | string;
};

export async function generateStaticParams() {
  return Object.keys(catalog.cable_catalog).map((id) => ({ id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const keys = Object.keys(catalog.cable_catalog);
  const id = params.id;

  if (!keys.includes(id)) return notFound();

  const product = catalog.cable_catalog[id] as Product;
  const index = keys.indexOf(id);
  const nextId = keys[(index + 1) % keys.length];
  const prevId = keys[(index - 1 + keys.length) % keys.length];

  return (
    <div>
      <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:ml-[100px] lg:px-0 sm:hidden">
        <BackButtonClient  />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Carousel images={product.images} productName={product.name} />
          <ProductDetails product={product} />
        </div>

        <ProductNavigationClient
          nextId={nextId}
          prevId={prevId}
        />
      </main>
    </div>
  );
}