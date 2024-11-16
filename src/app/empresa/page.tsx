import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Users, Target, Factory } from "lucide-react";

export default function EmpresaPage() {
  return (
    <div className="flex justify-center">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="relative mb-12 h-[400px]">
          <Image
            src="/assets/slide1.jpg"
            alt="Fábrica Nasello Cables"
            fill
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 flex items-center justify-center text-center text-white">
            <div>
              <h1 className="mb-4 text-5xl font-bold">Nuestra Empresa</h1>
              <p className="text-xl">
                Más de 50 años de experiencia en la industria del cable
              </p>
            </div>
          </div>
        </div>

        {/* Historia y Valores */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Historia y Valores</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-4 text-lg">
                Desde 1970, Nasello Cables se ha dedicado a la fabricación y
                comercialización de cables y conductores eléctricos, manteniendo
                siempre los más altos estándares de calidad y servicio.
              </p>
              <p className="text-lg">
                Nuestra trayectoria nos ha permitido consolidarnos como una empresa
                líder en el mercado, gracias a la confianza de nuestros clientes y
                al compromiso constante con la excelencia.
              </p>
            </div>
            <div className="relative h-[300px]">
              <Image
                src="/assets/slide2.jpg"
                alt="Historia Nasello Cables"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Pilares */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Nuestros Pilares</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader>
                <History className="h-12 w-12 text-primary" />
                <CardTitle>Experiencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Más de 50 años en la industria nos respaldan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary" />
                <CardTitle>Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Personal altamente capacitado y comprometido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-12 w-12 text-primary" />
                <CardTitle>Objetivos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Enfocados en la satisfacción del cliente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Factory className="h-12 w-12 text-primary" />
                <CardTitle>Infraestructura</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Tecnología de última generación</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instalaciones */}
        <div>
          <h2 className="mb-8 text-3xl font-bold">Nuestras Instalaciones</h2>
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
                src="/assets/MAQUINARIA.jpg"
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