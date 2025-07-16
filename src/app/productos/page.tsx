
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import catalog from "@/data/cable_catalog.json";
import { Plus } from "lucide-react";

type Product = {
  name: string;
  description: string;
  images: (string | { url: string; label?: string })[];
  technical_specs: string[] | string;
};

type ProductData = {
  [key: string]: Product;
};

export default function ProductosPage() {
  const products: ProductData = catalog.cable_catalog;

 return (
  <div className="flex justify-center">
    <div className="container py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-9 text-center text-3xl sm:text-4xl font-bold">NUESTROS PRODUCTOS</h1>

      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(products).map(([id, product]) => {
          const image = Array.isArray(product.images)
            ? typeof product.images[0] === "string"
              ? product.images[0]
              : product.images[0]?.url || "/placeholder.png"
            : "/placeholder.png";

          return (
            <Link href={`/productos/${id}`} key={id}>
              <div className="overflow-hidden transition-all hover:scale-[1.05] group">
                {/* Fondo gris claro con solo la esquina superior derecha redondeada */}
                <div className="bg-[#f0f0f0] overflow-hidden rounded-tr-[40px] relative">
                  {/* Imagen del producto */}
                  <div className="relative aspect-[1.3] w-full">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-fill"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 32vw, 30vw"
                      quality={90}
                    />
                  </div>

                  {/* Banda blanca colocada con posición absoluta inferior */}
                  <div className="absolute bottom-3 sm:bottom-5 w-full h-8 bg-white px-3 py-1 flex items-center justify-between ">
                    <span className="font-bold text-black text-xs sm:text-sm md:text-base truncate pr-2">{product.name}</span>
                    <div className="w-6 h-6 rounded-full border border-primary bg-primary flex items-center justify-center flex-shrink-0">
                      <Plus className="text-white w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);
}