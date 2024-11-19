import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto  py-12 max-sm:p-4">
        <div className="grid grid-cols-1  gap-8 md:grid-cols-4">
          <div className=""> 
            <h3 className="text-lg text font-semibold text-white">Nasello Cables</h3>
            <p className="mt-4">
              Más de 50 años de experiencia en la fabricación y comercialización de cables y conductores eléctricos.
            </p>
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
              <li>J. Saulmer 1008,Luján, Buenos Aires</li>
              <li>(+54) 2323 423-702</li>
              <li>ventas@nasellocables.com</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Síguenos</h3>
            <div className="mt-4 flex space-x-4">
              <a
                href="#"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
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
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Nasello Cables. Todos los derechos reservados.| Developed by Vicente Woinilowicz</p>
        
        </div>
      </div>
    </footer>
  );
};

export default Footer;