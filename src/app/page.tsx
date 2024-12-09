import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Shield, Award, Zap, Factory } from "lucide-react";
import { ImageSlider } from "@/components/ImageSlider";
import { Banners } from "@/components/Banners";



export default function Home() {
  return (
    <>

      <section className="relative">
        <ImageSlider />
        <div className="absolute inset-0 flex z-10 items-center justify-center max-sm:p-4">
          <div className="container text-center text-white max-sm:hidden">
            <h1 className="mb-6 text-5xl font-medium text-white">
              CALIDAD Y CONFIABILIDAD EN CADA PRODUCTO
            </h1>
            <p className="mb-8 text-xl">Más de 40 años de experiencia en la industria</p>
            <Button asChild size="lg" className="bg-primary hover:bg-secondary">
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </div>
        </div>
      </section>



      {/* Products Preview Section */}
      <section className="bg-gray-50 py-16 flex justify-center max-sm:p-4" >
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            NUESTROS PRODUCTOS DESTACADOS
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Cables Subterráneos",
                image: "/assets/SubteHome.jpeg",
                description: "Cables de alta resistencia para instalaciones subterráneas",
              },
              {
                title: "Cables para Soldadura",
                image: "/assets/SoldaduraHome.png",
                description: "Especialistas en la confección de cables de soldadura desde 1976",
              },
              {
                title: "Cables Unipolares",
                image: "/assets/Unipolares.jpeg",
                description: "Tenemos nuevas propuestas para seguir transmitiendo energía en el futuro",
              },
            ].map((product, index) => (
              <Card key={index} className="group transition-all duration-300 hover:scale-[1.07] hover:shadow-lg">
                <div className="relative min-h-[300px] w-full">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className=" object-contain transition-all duration-300 group-hover:brightness-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={90}
                  />

                </div>
                <CardHeader>
                  <CardTitle>{product.title}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="default" asChild className="w-full hover:bg-secondary">
                    <Link href="/productos">Ver Más</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className=" flex justify-center py-16  max-sm:p-4">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4 items-center">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary" />
                <CardTitle>Calidad Garantizada</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Productos certificados bajo estrictos estándares de calidad</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-primary" />
                <CardTitle>Experiencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Más de 40 años en la industria de cables eléctricos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary" />
                <CardTitle>Innovación</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Tecnología de última generación en nuestros procesos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Factory className="h-12 w-12 text-primary" />
                <CardTitle>Fabricación Local</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Producción nacional con los más altos estándares</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Banners />
      {/* CTA Section */}
      <section className=" flex justify-center bg-primary py-8 text-white">
        <div className="container text-center">
          <h2 className="mb-6 text-2xl font-bold">
            ¿Necesita asesoramiento profesional?
          </h2>
          <p className="mb-8 text-lg">
            Nuestro equipo de expertos está listo para ayudarte
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-secondary hover:text-white"
          >
            <Link href="/contacto">Contáctenos</Link>
          </Button>
        </div>
      </section>
    </>
  );
}