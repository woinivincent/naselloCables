import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">

      <div className="container mx-auto  max-sm:p-4">
        <Image
          src={"/assets/logo.png"}
          alt="Logo"
          width={100}
          height={80}
          className="w-[180px] relative left-1/2 -translate-x-1/2"
        />
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
            <h3 className="text-lg font-semibold text-white">Síguenos</h3>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://www.youtube.com/@NaselloCables"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-7 w-7" />
              </a>
              <a
                href="https://www.instagram.com/nasellocables_sa/"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >

              </a>

            </div>
            <Image
              src="/assets/Iso9001.png"
              alt="Iso9001"
              className="h-[90px] w-[230px] mt-5"
              width={50}
              height={24}

            />
          </div>
        </div>

        <div className="my-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Nasello Cables. Todos los derechos reservados.| Developed by Vicente Woinilowicz</p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;