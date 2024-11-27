// src/app/productos/[id]/ProductDetails.tsx
'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Shield, Truck, Zap } from "lucide-react";
import Link from "next/link";

type Product = {
  name: string;
  description: string;
  images: string[];
  technical_specs: string;
  codes: string[];
  colors: string[];
};

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
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
            <Zap className="text-primary" size={100} />
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

        <Button type="button" className="mt-4 bg-primary text-white hover:bg-secondary w-full" variant="secondary">
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
  );
}
