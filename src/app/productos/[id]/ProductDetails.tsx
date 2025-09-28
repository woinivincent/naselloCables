'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";

import Shield from '@/icons/producto_Calidad.svg';
import Package from '@/icons/producto_Stock.svg';
import Truck from '@/icons/producto_Envio.svg';

type Product = {
  id: string;
  name: string;
  description: string;
  images: (string | { url: string; label: string })[];
  codes: string[];
  colors: string[];
  presentation: string[];
  technical_specs: string[] | string;
  use: string | null;
};

type ProductDetailsProps = {
  product: Product;

};

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 uppercase">{product.name}</h1>

        <p className="text-gray-700 leading-5">{product.description}</p>
        {product.use && (
          <p className="text-gray-700 mb-4 ">
            <span className="font-bold">
              {product.use.split(":")[0]}:
            </span>
            {` ${product.use.split(":").slice(1).join(":").trim()}`}
          </p>
        )}

        {/* Ficha técnica dinámica */}
        <div className="text-sm space-y-2">
          {Array.isArray(product.technical_specs) ? (
            product.technical_specs.map((spec, index) => (
              <div key={index}>
                <p className="font-bold">{spec}</p>
                {index !== product.technical_specs.length - 1 && (
                  <hr className="border-gray-300" />
                )}
              </div>
            ))
          ) : (
            <p>{product.technical_specs}</p>
          )}
        </div>

        <div className="border-b border-t border-gray-300 text-sm font-bold uppercase mt-6">
          <div className="flex items-center gap-2 mt-1 mb-1">
            <Image
              src="/icons/producto_Stock.svg"
              alt="Stock"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>Stock disponible</span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex items-center gap-2 mt-1 mb-1">
            <Image
              src="/icons/producto_Calidad.svg"
              alt="Certificado"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>Certificado</span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex items-center gap-2 mt-1 mb-1">
            <Image
              src="/icons/producto_Envio.svg"
              alt="Envío"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span>Envío</span>
          </div>
        </div>
        {/* Botones */}
        <div className="flex flex-col gap-y-4 pt-6">
          {/* <Button className="bg-gray-500 hover:bg-gray-600 text-white w-min rounded-md text-xs">
            DESCARGAR FICHA TÉCNICA
          </Button>*/}
          <Button className="bg-primary hover:bg-secondary text-white w-max rounded-md text-xs">
            <a href="/pedidos">SOLICITAR COTIZACIÓN</a>

          </Button>
        </div>
      </div>
    </div>
  );
}