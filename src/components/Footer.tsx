import Link from "next/link";
import Image from "next/image";
import { Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0092d1] text-white">
      {/* Main footer content */}
      <div className="pl-8 py-8 w-full sm:pl-4 sm:pr-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 items-center justify-end">
          {/* Left column - Logo and tagline */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Image
              src="/assets/Logo-Nasello_negativo.png"
              alt="Nasello Cables"
              width={180}
              height={50}
              className="h-auto w-auto"
            />
            <p className="text-sm mt-2 max-w-[220px]">
              Líderes en conductores eléctricos desde hace más de 40 años.
            </p>
          </div>

          {/* Middle column - Navigation, contact, social */}
          <div className="flex flex-col md:flex-row gap-8 lg:px-8 items-center lg:items-start text-center lg:text-left">
            <div className=" border-white/50 px-0 lg:px-4">
              {/* Navigation links */}
              <nav>
                <ul className="flex flex-col space-y-1 font-semibold">
                  <li><Link href="/productos" className="hover:underline">Productos</Link></li>
                  <li><Link href="/empresa" className="hover:underline">Empresa</Link></li>
                  <li><Link href="/calidad" className="hover:underline">Calidad</Link></li>
                  <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
                  <li><Link href="/pedidos" className="hover:underline">Pedidos</Link></li>
                </ul>
              </nav>
            </div>

            <div className="lg:border-x border-white/50 px-0 lg:px-4">
              {/* Contact information */}
              <div className="text-sm lg:ml-6">
                <p className="mb-1">J. Saulmer 1008, B6700, Luján,</p>
                <p className="mb-1">Buenos Aires, Argentina</p>
                <p className="mb-1">Tel.: (+54) 9 2323 610622</p>
                <p className="mb-1">info@nasellocables.com.ar</p>
                <p className="mb-1">ventas@nasellocables.com.ar</p>

                {/* Social icons */}
                <div className="flex gap-3 mt-3 justify-center lg:justify-start">
                  <a href="mailto:info@nasellocables.com.ar" aria-label="Email">
                    <Image src="/assets/email.svg" alt="Email" width={28} height={28} />
                  </a>
                  <a href="https://wa.me/5492323354771" aria-label="WhatsApp">
                    <Image src="/assets/whatsapp.svg" alt="WhatsApp" width={28} height={28} />
                  </a>
                  <a href="https://instagram.com/nasellocables" aria-label="Instagram">
                    <Image src="/assets/instagram.svg" alt="Instagram" width={28} height={28} />
                  </a>
                  <a href="https://youtube.com/@nasellocables" aria-label="YouTube">
                    <Image src="/assets/youtube.svg" alt="YouTube" width={28} height={28} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Certifications */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[500px]">
              <Image
                src="/assets/sellos_pie.png"
                alt="TÜV ISO Certificados"
                width={500}
                height={100}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="text-center text-white text-sm py-3 border-t border-white/50 px-4">
        © {new Date().getFullYear()} Nasello Cables. Todos los derechos reservados. | Developed by Vicente Woinilowicz
      </div>
    </footer>
  );
};

export default Footer;
