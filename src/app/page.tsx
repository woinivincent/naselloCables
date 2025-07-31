import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageSlider } from "@/components/ImageSlider";
import { videoSlide, imageSlides } from "@/components/ImageSlider/data";

export default function Home() {
  return (
    <>
      {/* Slider con solo el video */}
      <section className="relative h-[320px] sm:h-[400px] md:h-[400px]">
        <ImageSlider slides={[videoSlide]} />
      </section>

      {/* Sección de productos destacados */}
      <section
        className="bg-cover bg-center bg-no-repeat py-10 px-4"
        style={{ backgroundImage: "url('/assets/fondo-home.jpg')" }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-black">
            NUESTROS PRODUCTOS DESTACADOS
          </h2>

          <div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start justify-center">
            {[
              {
                title: "Cables Subterráneos",
                description:
                  "Cables de alta resistencia para realizar instalaciones bajo tierra.",
                image: "/assets/imagen-home-destacado_subterraneo.jpg",
                slug: "subterraneos",
              },
              {
                title: "Cables para soldadura",
                description:
                  "Especialistas en la confección de cables de soldadura desde 1976",
                image: "/assets/imagen-home-destacado_soldadura.jpg",
                slug: "soldadura",
              },
              {
                title: "Cables Unipolares",
                description:
                  "Amplia variedad de secciones y colores en cables de uso domiciliario e industrial",
                image: "/assets/imagen-home-destacado_unipolares.jpg",
                slug: "unipolar_antillama",
              },
            ].map((product, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Imagen redonda con borde */}
                <div className="rounded-full border-[6px] border-gray-300 overflow-hidden w-64 h-64 flex items-center justify-center bg-gradient-to-b from-gray-200 to-white shadow-inner">
                  <div className="relative w-64 h-64">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
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

      {/* Imagen con texto central */}
     {/* <section className="relative h-[280px] sm:h-[320px] md:h-[400px] w-full">
        <Image
          src="/assets/imagen-home-celeste.jpg"
          alt="Imagen de fondo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <h1 className="text-white text-xl sm:text-3xl md:text-5xl font-bold drop-shadow-lg px-2">
            Logrando cinco décadas de experiencia
          </h1>
        </div>
      </section>*/}

      {/* Slider con imágenes */}
      <section className="relative bg-white overflow-hidden">
        {/* Altura automática para que se adapte a la imagen */}
        <ImageSlider slides={imageSlides} />
      </section>

      {/* Sección de íconos y ventajas */}
      <section className="bg-gray-100 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-center">
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
                description: "Cinco décadas haciendo historia en el rubro.",
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
                description: "Producción nacional con estándar asegurado.",
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