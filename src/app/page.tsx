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

import { slides } from "@/components/ImageSlider/data";




export default function Home() {
  return (
    <>

      <section className="relative h-full max-sm:h-[320px] " >
        <ImageSlider slides={slides} />
        <div className="absolute inset-0 flex z-10 items-center justify-center ">
          {/* <div className="container text-center text-white max-sm:hidden">
            <h1 className="mb-6 text-5xl font-medium text-white">
              CALIDAD Y CONFIABILIDAD EN CADA PRODUCTO
            </h1>
            <p className="mb-8 text-xl">Más de 40 años de experiencia en la industria</p>
            <Button asChild size="lg" className="bg-primary hover:bg-secondary">
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </div>*/}
        </div>
      </section>



      <section
        className="bg-cover bg-center bg-no-repeat py-10 px-4"
        style={{ backgroundImage: "url('/assets/fondo-home.jpg')" }}
      >

        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-black">
            NUESTROS PRODUCTOS DESTACADOS
          </h2>


          <div className="grid gap-10 md:grid-cols-3 items-start justify-center ">
            {[
              {
                title: "Cables Subterráneos",
                description: "Cables de alta resistencia para realizar instalaciones bajo tierra.",
                image: "/assets/imagen-home-destacado_subterraneo.jpg",
                slug: "subterraneos",
              },
              {
                title: "Cables para soldadura",
                description: "Especialistas en la confección de cables de soldadura desde 1976",
                image: "/assets/imagen-home-destacado_soldadura.jpg",
                slug: "soldadura",
              },
              {
                title: "Cables Unipolares",
                description: "Amplia variedad de secciones y colores en cables de uso domiciliario e industrial",
                image: "/assets/imagen-home-destacado_unipolares.jpg",
                slug: "unipolar_antillama",
              },
            ].map((product, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Imagen redonda con borde */}
                <div className="rounded-full border-[6px] border-gray-300 overflow-hidden w-68 h-68 flex items-center justify-center bg-gradient-to-b from-gray-200 to-white shadow-inner">
                  <div className="relative w-72 h-72">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-fill"
                    />
                  </div>
                </div>

                {/* Texto */}
                <h3 className="text-lg font-semibold text-black mt-6 mb-2">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 max-w-xs">
                  {product.description}
                </p>

                {/* Botón */}
                <Link
                   href={`/productos/${product.slug}`}
                  className="bg-[#009CDE] hover:bg-[#007bb8] text-white text-sm font-medium px-5 py-2 rounded-full transition"
                >
                  Ver más
                </Link>
              </div>
            ))}
          </div>
        </div>

      </section>
      <section className="bg-white py-12 px-6 relative overflow-hidden h-[450px]">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">

          {/* Imagen fuera del container hacia la izquierda */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 max-w-none">
            <img
              src="/assets/imagen-home-fotovoltaico.jpg"
              alt="Cable solar"
              className="w-full"
            />
          </div>

          {/* Texto u otro contenido centrado */}
          <div className="w-full md:w-1/2 ml-auto flex flex-col mt-28  text-justify">
            {/* Aquí tu contenido textual */}
            <h2 className="text-3xl font-bold">Sumando sustentabilidad</h2>
            <p className="mt-4 text-gray-700">Nueva línea de cables fotovoltaicos <br />
              alternativa de alta calidad.</p>
          </div>
        </div>
      </section>
      <section className="relative h-[400px] sm:h-[300px] w-full">
        <Image
          src="/assets/imagen-home-celeste.jpg"
          alt="Imagen de fondo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <h1 className="text-white text-3xl sm:text-5xl font-bold drop-shadow-lg">
            Logrando cinco décadas de experiencia

          </h1>
        </div>
      </section>


      <section className="bg-gray-100 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid gap-10 md:grid-cols-4 text-center">
            {[
              {
                icon: "/assets/Calidad.svg",
                title: "Calidad Garantizada",
                description:
                  "Productos certificados bajo estrictos estándares de calidad.",
              },
              {
                icon: "/assets/Experiencia.svg",
                title: "Experiencia",
                description:
                  "Cinco décadas haciendo historia en el rubro.",
              },
              {
                icon: "/assets/Innovacion.svg",
                title: "Innovación",
                description:
                  "Tecnología de última generación en nuestros procesos.",
              },
              {
                icon: "/assets/Fabricacion.svg",
                title: "Fabricación Nacional",
                description:
                  "Producción nacional con estándar asegurado.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-start h-full px-4"
              >
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">
                  {item.title}
                </h3>
                <p className="text-base text-gray-700 max-w-[240px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>




    </>
  );
}