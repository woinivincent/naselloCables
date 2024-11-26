import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Definimos el tipo para los productos
type Product = {
  name: string;
  description: string;
  images: string[];
  technical_specs: string;
};

type ProductData = {
  [key: string]: Product;
};

export default async function ProductosPage() {
  // Ruta del archivo JSON
  const filePath = path.join(process.cwd(),"public", "data", "cable_catalog.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(jsonData);

  // Obtenemos los productos del catálogo
  const products: ProductData = parsedData.cable_catalog;

  return (
    <div className="flex justify-center">
      <div className="container py-12">
        <h1 className="mb-9 text-center text-4xl font-bold">NUESTROS PRODUCTOS</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(products).map(([id, product]) => (
            <Link href={`/productos/${id}`} key={id}>
              <Card className={cn(
                "overflow-hidden group relative transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
                "before:absolute before:inset-0 before:opacity-0 before:transition-opacity"
              )}>
                <div className="relative aspect-[19/6] w-full transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={product.images[2]}  // Usa la primera imagen del array
                    alt={product.name}
                    fill
                    className="object-center transition-all duration-300 group-hover:brightness-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={90}
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default" className="text-xs">
                      {product.technical_specs}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
