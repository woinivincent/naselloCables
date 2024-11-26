import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Award, FileCheck } from "lucide-react";

export default function CalidadPage() {
  return (
    <div className="flex justify-center ">
      <div className="container py-12 ">
        {/* Hero Section */}
        <div className="relative mb-12 h-[400px] ">
          <Image
            src="/assets/DESPACHO.jpg"
            alt="Control de Calidad"
            fill
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 flex items-center justify-center text-center text-white ">
            <div>
              <h1 className="mb-4 text-5xl font-bold">GESTIÓN DE CALIDAD</h1>
              <p className="text-xl">
                Comprometidos con la excelencia en cada producto
              </p>
            </div>
          </div>
        </div>

        {/* Certificaciones */}
        <div className="mb-16 max-sm:p-4">
          <h2 className="mb-8 text-3xl font-bold">NUESTRAS CERTIFICACIONES</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary" />
                <CardTitle>ISO 9001:2015</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Sistema de Gestión de Calidad certificado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-primary" />
                <CardTitle>IRAM</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Certificación de productos según normas IRAM</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-12 w-12 text-primary" />
                <CardTitle>IEC</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Cumplimiento de estándares internacionales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary" />
                <CardTitle>Laboratorio</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Laboratorio de ensayos técnicos interno</p>
              </CardContent>
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

                A través de la implementación y el mantenimiento del Sistema de Gestion de Calidad, Nasello Cables S.A. se compromete a cumplir los requisitos aplicables a sus productos, como así también trabaja para hacer realidad los siguientes objetivos de calidad:
              </p>
              <ul className="list-inside list-disc space-y-2 mb-4">
                <li>Orientar el negocio para brindar productos para las nuevas fuentes de energía sustentables con el medio ambiente.</li>
                <li>Aumentar las ventas, y la rentabilidad del negocio.</li>
                <li>Aumentar la satisfacción de clientes y que seamos su mejor opción.</li>
                <li>Aumentar la eficiencia de los procesos productivos siempre cuidando las pautas de orden y limpieza establecidas.</li>
                <li>Informatizar la planta para lograr información on line y precisa, permitiendo así una rápida reacción.</li>
                <li>Hacer de Nasello Cables un buen lugar para trabajar y desarrollarse.</li>
                <li>Promover la Mejora Continua.</li>

              </ul>
              <span className="text-right">
                <p>La Dirección
                  <br /> Abril 2023</p>  
                </span>
            </div>
            <div className="relative h-[500px] ">
              <Image
                src="/assets/slide3.jpg"
                alt="Proceso de Control"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Laboratorio */}
        <div className="max-sm:p-4">
          <h2 className="mb-8 text-3xl font-bold ">NUESTRO LABORATORIO</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative h-[250px]">
              <Image
                src="/assets/Labo4.jpeg"
                alt="Laboratorio 1"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-[250px]">
              <Image
                src="/assets/Labo3.jpeg"
                alt="Laboratorio 2"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-[250px]">
              <Image
                src="/assets/Labo2.jpeg"
                alt="Laboratorio 3"
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