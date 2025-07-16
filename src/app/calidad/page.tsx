
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Award, FileCheck, Import } from "lucide-react";
import IEC from "@/icons/Certificaciones_IEC.svg"
import IRAM from "@/icons/Certificaciones_IRAM.svg"
import ISO from "@/icons/Certificaciones_ISO-9001.svg"
import LABO from "@/icons/Certificaciones_LABORATORIO.svg"

export default function CalidadPage() {
  return (
    <div>
      {/* Hero Section - FUERA del container, ocupa toda la pantalla */}
      <div className="relative mb-12 h-[400px] w-full">
        <Image
          src="/assets/imagen-encabezado-calidad.jpg"
          alt="Control de Calidad"
          fill
          quality={1}
          className="object-cover "
        />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <h1 className="mb-4 text-5xl font-bold">Mejora continua</h1>
            <p className="text-xl">
               Comprometidos con el proceso minucioso que conlleva el producto.

            </p>
          </div>
        </div>
      </div>

      {/* Resto del contenido - CON container */}
      <div className="flex justify-center">
        <div className="container py-12">
          {/* Certificaciones */}
          <div className="mb-16 max-sm:p-4">
            <h2 className="mb-8 text-3xl font-bold">NUESTRAS CERTIFICACIONES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex items-center ">
                  <ISO height={100} />
                  <div>
                    <CardTitle className="text-lg font-bold mb-1 ml-6">ISO 9001:2015</CardTitle>
                    <CardContent>
                      <p className="text-sm text-gray-600">Sistema de Gestión de Calidad certificado</p>
                    </CardContent>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex items-center ">
                  <IRAM height={100} />
                  <div>
                    <CardTitle className="text-lg font-bold mb-1 ml-6">IRAM</CardTitle>
                    <CardContent>
                      <p className="text-sm text-gray-600">Certificación de productos según normas IRAM</p>
                    </CardContent>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex items-center ">
                  <IEC height={100} />
                  <div>
                    <CardTitle className="text-lg font-bold mb-1 ml-6">IEC</CardTitle>
                    <CardContent>
                      <p className="text-sm text-gray-600">Cumplimiento de estándares internacionales</p>
                    </CardContent>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex items-center ">
                  <LABO height={100} />
                  <div>
                    <CardTitle className="text-lg font-bold mb-1 ml-6">LABORATORIO</CardTitle>
                    <CardContent>
                      <p className="text-sm text-gray-600">Laboratorio de ensayos técnicos interno.</p>
                    </CardContent>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Proceso de Control */}
          <div className="mb-16 max-sm:p-4">
            <h2 className="mb-8 text-3xl font-bold">PROCESO DE CONTROL DE CALIDAD</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-4 text-balance">
                  Nasello Cables S.A. es una empresa con amplia trayectoria en la fabricación de cables para la industria eléctrica y de la construcción, comprometida en brindar a sus clientes productos confiables que cumplan con los más altos estándares de calidad, así como de proveer un servicio de post venta y asesoramiento de excelencia.
                  <br />
                  <br />
                  A través de la implementación y el mantenimiento del Sistema de Gestion de Calidad, Nasello Cables S.A. se compromete a cumplir los requisitos aplicables a sus productos, como así también trabaja para hacer realidad los siguientes objetivos de calidad:
                </p>
                <ul className="list-inside list-disc space-y-2 mb-4 font-bold">
                  <li>Orientar el negocio para brindar productos para las nuevas fuentes de energía sustentables con el medio ambiente.</li>
                  <li>Aumentar las ventas, y la rentabilidad del negocio.</li>
                  <li>Aumentar la satisfacción de clientes y que seamos su mejor opción.</li>
                  <li>Aumentar la eficiencia de los procesos productivos siempre cuidando las pautas de orden y limpieza establecidas.</li>
                  <li>Informatizar la planta para lograr información on line y precisa, permitiendo así una rápida reacción.</li>
                  <li>Hacer de Nasello Cables un buen lugar para trabajar y desarrollarse.</li>
                  <li>Promover la Mejora Continua.</li>
                </ul>
                <span className="text-left text-xs">
                  <p>La Dirección / Abril 2025</p>
                </span>
              </div>
              <div className="relative h-[500px]">
                <Image
                  src="/assets/foto_derecha-calidad.jpg"
                  alt="Proceso de Control"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>

          {/* Laboratorio */}
          <div className="max-sm:p-4">
            <h2 className="mb-8 text-3xl font-bold">NUESTRO LABORATORIO</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative h-[250px]">
                <Image
                  src="/assets/foto_calidad-1.jpg"
                  alt="Laboratorio 1"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="relative h-[250px]">
                <Image
                  src="/assets/foto_calidad-2.jpg"
                  alt="Laboratorio 2"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="relative h-[250px]">
                <Image
                  src="/assets/foto_calidad-3.jpg"
                  alt="Laboratorio 3"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}