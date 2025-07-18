'use client';

import { Button } from "@/components/ui/button";

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
};

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 uppercase">{product.name}</h1>

        <p className="text-gray-700 mb-4 leading-relaxed">{product.description}</p>

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

        {/* Iconografía */}
        <div className="border-b border-t border-gray-300 text-sm font-bold uppercase mt-6">
          <div className="flex items-center gap-2 mt-1 mb-1">
            <Package size={16} />
            <span>Stock disponible</span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex items-center gap-2 mt-1 mb-1">
            <Shield size={16} />
            <span>Certificado</span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex items-center gap-2 mt-1 mb-1">
            <Truck size={16} />
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