import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Users, Target, Factory } from "lucide-react";
import TimelineSection from "@/components/Timeline";

export default function EmpresaPage() {
  return (
    <div className="flex justify-center">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="relative mb-12 h-[400px]">
          <Image
            src="/assets/slider5.jpg"
            alt="Fábrica Nasello Cables"
            fill
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 flex items-center justify-center text-center text-white">
            <div>
              <h1 className="mb-4 text-5xl font-medium">NUESTRA EMPRESA</h1>
              <p className="text-xl font-light">
                Más de 40 años de experiencia en la industria del cable
              </p>
            </div>
          </div>
        </div>

        {/* Historia y Valores */}
        <div className="mb-10 max-sm:p-4">
          <h2 className="mb-8 text-3xl font-medium">HISTORIA Y VALORES</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-4 text-lg font-light">
                En Nasello Cables S.A somos líderes en conductores eléctricos desde hace más de 40 años, ofrecemos soluciones de alta calidad y confiabilidad para todo el país.
                <br />
                Calidad, Innovación y Servicio en la industria nacional
                <br />
                En estos últimos años nos perfeccionamos para poder ofrecerles certificaciones de calidad, con un laboratorio completamente equipado.
                Brindamos atención personalizada para grandes y medianos distribuidores.
                <br />
                Conócenos más
                <br />

              </p>
              <p className="text-lg font-light">
                Explora nuestra página web para saber más sobre nuestros productos y servicios.

                Seguimos transmitiendo energía 
              </p>
            </div>
            <div className="relative h-[300px]">
              <Image
                src="/assets/slider4.jpg"
                alt="Historia Nasello Cables"
                fill
                
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Pilares */}
        <div className="max-sm:p-4">
          <TimelineSection />
        </div>

        {/* Instalaciones */}
        <div className="max-sm:p-4">
          <h2 className="mb-8 text-3xl font-medium">NUESTRAS INSTALACIONES</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative h-[250px]">
              <Image
                src="/assets/ZSTOCKK.jpeg"
                alt="Planta de producción"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-[250px]">
              <Image
                src="/assets/slider3.jpg"
                alt="Laboratorio de control"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-[250px]">
              <Image
                src="/assets/DESPACHO.jpg"
                alt="Almacén"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}