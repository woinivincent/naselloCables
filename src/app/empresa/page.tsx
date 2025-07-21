import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Users, Target, Factory } from "lucide-react";
import TimelineSection from "@/components/Timeline";
import { Button } from "@/components/ui/button";

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
              <h1 className="mb-4 text-5xl font-medium">UN LEGADO FAMILIAR</h1>
              <p className="text-xl font-light">
                Dos generaciones de experiencia compartida en la industria.

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
                Nasello Cables S.A. | Logrando 50 años en el mercado de conductores
                eléctricos.
              </p>
              <p className="mb-4  font-light align-middle text-justify">
                Contamos con una sólida trayectoria de más de cuatro décadas en la
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
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              {/* Video de YouTube */}
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover absolute top-0 left-0"
              >
                <source src={"/assets/Video_slider.mp4"} type="video/mp4" />
              </video>
              {/* Botón en la esquina inferior izquierda */}
              <a
                href="https://www.youtube.com/watch?v=Js76327Blos"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 z-10"
              >
                <Button className="bg-gray-500 hover:bg-secondary text-white w-max rounded-md text-xs">
                  VER VIDEO
                </Button>
              </a>

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
                  src="/assets/foto-empresa-2.jpg"
                  alt="Planta de producción"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="relative h-[250px]">
                <Image
                  src="/assets/foto-empresa-1.jpg"
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


    </div>);
}