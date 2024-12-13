
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Carousel from "@/components/Carousel";
import Link from "next/link";
import { ProductDetails } from "./ProductDetails";
import { ProductNavigation } from "./ProductNavigation";
import { ArrowLeft } from 'lucide-react';

type Product = {
  name: string;
  description: string;
  images: string[];
  technical_specs: string;
  codes: string[];
  colors: string[];
};

type CatalogData = {
  cable_catalog: { [key: string]: Product };
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [paramId, setParamId] = useState<string | null>(null);

  useEffect(() => {

    params.then(({ id }) => setParamId(id));
  }, [params]);


  useEffect(() => {
    async function fetchCatalogData() {
      const response = await fetch('/data/cable_catalog.json');
      const data = await response.json();
      setCatalogData(data);
      const keys = Object.keys(data.cable_catalog);
      setProductKeys(keys);
      if (paramId) {
        const initialProduct = data.cable_catalog[paramId];
        setCurrentProduct(initialProduct);
        setCurrentIndex(keys.indexOf(paramId));
      }
    }

    if (paramId) {
      fetchCatalogData();
    }
  }, [paramId]);

  const goToNextProduct = () => {
    const nextIndex = (currentIndex + 1) % productKeys.length;
    const nextProduct = catalogData?.cable_catalog[productKeys[nextIndex]];
    setCurrentProduct(nextProduct || null);
    setCurrentIndex(nextIndex);
  };

  const goToPreviousProduct = () => {
    const prevIndex = (currentIndex - 1 + productKeys.length) % productKeys.length;
    const prevProduct = catalogData?.cable_catalog[productKeys[prevIndex]];
    setCurrentProduct(prevProduct || null);
    setCurrentIndex(prevIndex);
  };

  if (!catalogData || !currentProduct) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <div className="max-w-7xl mx-auto pt-2">

          <Link href="/productos" className="flex items-center gap-2 text-sm hover:text-blue-100">
            <ArrowLeft size={20} />
            Volver al Catálogo
          </Link>
     
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagen del Producto */}
          <Carousel images={currentProduct.images} productName={currentProduct.name} />

          {/* Información del Producto */}
          <ProductDetails product={currentProduct} />
        </div>

        {/* Navegación entre productos */}
        <ProductNavigation
          goToNextProduct={goToNextProduct}
          goToPreviousProduct={goToPreviousProduct}
        />
      </main>
    </div>
  );
}
