import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Shield, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/Carousel";

type Product = {
  name: string;
  description: string;
  images: string[];
  technical_specs: string;
  codes: string[];
  colors: string[];
};

type Props = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getProductById(id: string): Promise<Product | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "cable_catalog.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(jsonData);
    return parsedData.cable_catalog[id] || null;
  } catch (error) {
    console.error('Error loading product:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), "data", "cable_catalog.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(jsonData);
    
    return Object.keys(parsedData.cable_catalog).map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <div className="max-w-7xl mx-auto pt-2">
        <Button type="button" className="mt-4 bg-primary text-white hover:bg-secondary" variant="secondary">
          <Link href="/productos" className="flex items-center gap-2 text-sm hover:text-blue-100">
            <ArrowLeft size={20} />
            Volver al Catálogo
          </Link>
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagen del Producto */}
          <Carousel images={product.images} productName={product.name} />

          {/* Información del Producto */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Características Principales */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="text-primary" size={20} />
                  <span>Certificado</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="text-primary" size={32} />
                  <span>{product.technical_specs}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="text-primary" size={20} />
                  <span>Stock Disponible</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="text-primary" size={20} />
                  <span>Envío a todo el país</span>
                </div>
              </div>

              <Button
                type="button"
                className="mt-4 bg-primary text-white hover:bg-secondary w-full"
                variant="secondary"
              >
                <Link href="/pedidos">Solicitar Cotización</Link>
              </Button>
            </div>

            {/* Especificaciones */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Especificaciones</h2>
              <div className="space-y-4">
                {/* Códigos disponibles */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Códigos Disponibles:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.codes.map((code) => (
                      <span key={code} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colores disponibles */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Colores Disponibles:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span key={color} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Especificaciones técnicas */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Especificaciones Técnicas:</h3>
                  <p className="text-gray-600">{product.technical_specs}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}