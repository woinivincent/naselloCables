import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-primary text-white ">

      <div className="container mx-auto mt-8  max-sm:p-4">


        <div className="grid grid-cols-1 gap-7 md:grid-cols-4">

          <div className="">

            <h3 className="mt-1">
              Líderes en conductores eléctricos desde hace más de 40 años, ofrecemos soluciones de alta calidad y confiabilidad para todo el país.
              Calidad, Innovación y Servicio en la industria nacional
            </h3>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Enlaces</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/productos" className="hover:text-white">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/empresa" className="hover:text-white">
                  Empresa
                </Link>
              </li>
              <li>
                <Link href="/calidad" className="hover:text-white">
                  Calidad
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <ul className="mt-4 space-y-2">
              <li>Luján, Buenos Aires</li>
              <li>(+54) 9 2323 35-4771</li>
              <li>info@nasellocables.com</li>
            </ul>
          </div>

          <div>
           

          
            <div className="max-h-10 object-contain mb-3">  <Image
              src="/assets/iso9001.png"
              alt="Iso9001"
              className="size-full max-[768px]:size-4/12   "
              width={50}
              height={24}
              quality={100}

            /></div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm  max-[320px]:mt-7 max-[640px]:mt-7">© {new Date().getFullYear()} Nasello Cables. Todos los derechos reservados.| Developed by Vicente Woinilowicz</p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;