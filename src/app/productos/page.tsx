import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import fs from "fs";
import path from "path";

// Definimos el tipo para los productos que vamos a recibir
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
  const filePath = path.join(process.cwd(), 'data', 'cable_catalog.json');
  
  // Leemos el archivo JSON
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const parsedData = JSON.parse(jsonData);

  // Obtenemos los productos del catálogo
  const products: ProductData = parsedData.cable_catalog;

  return (
    <div className="flex justify-center">
      <div className="container py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Catálogo de Cables</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(products).map(([key, product]) => (
            <Card key={key} className={cn(
              "overflow-hidden group relative transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
              "before:absolute before:inset-0 before:opacity-0 before:transition-opacity",
              "before:bg-gradient-to-r before:from-blue-500/10 before:via-blue-700/10 before:to-blue-300/10",
              "hover:before:opacity-100 hover:-translate-y-1"
            )}>
              <div className="relative aspect-[19/6] w-full transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={product.images[0]}  // Usa la primera imagen del array
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
          ))}
        </div>
      </div>
    </div>
  );
}
