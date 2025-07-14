import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Users, Target, Factory } from "lucide-react";
import TimelineSection from "@/components/Timeline";

export default function EmpresaPage() {
  return (
    <div className="flex justify-center ">
      <div className=" py-12">
        {/* Hero Section */}
        <div className="relative mb-12 h-[400px] w-full">
          <Image
            src="/assets/imagen-encabezado-empresa.jpg"
            alt="Fábrica Nasello Cables"
            fill
            className="object-cover brightness-70"
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
        <div className="p-12 mb-10 max-sm:p-4">
          <h2 className="mb-8 text-3xl font-bold">HISTORIA Y VALORES</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-4 text-lg font-bold ">
                Nasello Cables S.A. | Más de 40 años liderando la industria de conductores
                eléctricos
              </p>
              <p className="mb-4 text-lg font-light"> Contamos con una sólida trayectoria de más de cuatro décadas en la
                fabricación de conductores eléctricos, brindando soluciones de alta calidad y
                confiabilidad en todo el territorio nacional.
                <br />
                <br />
                Comprometidos con los más altos estándares, nos enfocamos en la calidad,
                la innovación y el servicio, consolidándonos como un referente en la industria
                nacional. En los últimos años, hemos perfeccionado nuestros procesos e
                incorporado tecnología de vanguardia, incluyendo un laboratorio propio
                totalmente equipado para garantizar productos certificados y de excelencia.
                <br />
                <br />
                Ofrecemos atención personalizada a grandes y medianos distribuidores, con
                un enfoque orientado a construir relaciones de confianza a largo plazo.</p>
              <p className="text-lg font-light">
                Te invitamos a visitar nuestro sitio web y descubrir más sobre nuestros
                productos y servicios.
              </p>
            </div>
            <div className="relative h-[300px]">
              <Image
                src="/assets/foto-empresa-1.jpg"
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
        <div className="max-sm:p-4 p-5">
          <h2 className="mb-8 text-3xl font-medium">NUESTRAS INSTALACIONES</h2>
          <div className="grid gap-6 md:grid-cols-3 ">
            <div className="relative h-[250px]">
              <Image
                src="/assets/foto-empresa-1.jpg"
                alt="Planta de producción"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-[250px]">
              <Image
                src="/assets/foto-empresa-2.jpg"
                alt="Laboratorio de control"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-[250px]">
              <Image
                src="/assets/foto-empresa-3.jpg"
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