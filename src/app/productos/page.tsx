import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


type Product = {
  name: string;
  description: string;
  images: string[];
  technical_specs: string[];
};

type ProductData = {
  [key: string]: Product;
};

export default async function ProductosPage() {
 
  const filePath = path.join(process.cwd(), "public", "data", "cable_catalog.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const parsedData = JSON.parse(jsonData);

  
  const products: ProductData = parsedData.cable_catalog;

  return (
    <div className="flex justify-center">
      <div className="container py-12">
        <h1 className="mb-9 text-center text-4xl font-bold">NUESTROS PRODUCTOS</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(products).map(([id, product]) => (
            <Link href={`/productos/${id}`} key={id}>
              <Card
                className={cn(
                  "overflow-hidden group relative transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
                  "before:absolute before:inset-0 before:opacity-0 before:transition-opacity"
                )}
              >
                {/* Imagen del producto */}
                <div className="relative aspect-[16/9] w-full transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={product.images[1]}
                    alt={product.name}
                    fill
                    className="object-contain transition-all duration-300 group-hover:brightness-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 32vw, 30vw"
                    quality={90}
                  />
                </div>

                {/* Título del producto */}
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>

                {/* Contenido del producto */}
                <CardContent className="space-y-4 h-full flex flex-col justify-between">
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(product.technical_specs) ? (
                      <>
                        {/* Muestra solo las primeras dos badges */}
                        {product.technical_specs.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {/* Muestra un indicador si hay más badges */}
                      
                      </>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        {product.technical_specs}
                      </Badge>
                    )}
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
