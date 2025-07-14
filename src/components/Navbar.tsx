"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "HOME", href: "/" },
    { name: "EMPRESA", href: "/empresa" },
    { name: "PRODUCTOS", href: "/productos" },
    { name: "CALIDAD", href: "/calidad" },
    { name: "CONTACTO", href: "/contacto" },
    { name: "PEDIDOS", href: "/pedidos" },
  ];

  return (
    <header className="bg-gradient-to-b from-gray-100 to-white shadow-sm border-b-[4px] border-[#009CDE] relative z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* LOGO + LEMA */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="Nasello Cables"
            width={200}
            height={100}
     
            priority
          />
     
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <div className="hidden md:flex items-end space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-black hover:text-[#0092d1] text-sm  tracking-wide transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {/* ICONOS REDES */}
          <div className="flex items-center space-x-3 ml-6">
            <a href="mailto:recepcion@nasellocables.com.ar" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/email.svg" alt="Email" width={28} height={28} />
            </a>
            <a href="https://wa.me/5492323354771" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/whatsapp.svg" alt="WhatsApp" width={28} height={28} />
            </a>
            <a href="https://instagram.com/nasellocables" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/instagram.svg" alt="Instagram" width={28} height={28} />
            </a>
          </div>
        </div>

        {/* HAMBURGUER MOBILE */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* MENÚ MOBILE */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-sm font-medium text-black hover:text-[#009CDE]"
            >
              {item.name}
            </Link>
          ))}

          <div className="mt-4 flex space-x-4">
            <a href="mailto:recepcion@nasellocables.com.ar">
              <Image src="/assets/icons/email.svg" alt="Email" width={28} height={28} />
            </a>
            <a href="https://wa.me/5492323354771">
              <Image src="/assets/icons/whatsapp.svg" alt="WhatsApp" width={28} height={28} />
            </a>
            <a href="https://instagram.com/nasellocables">
              <Image src="/assets/icons/instagram.svg" alt="Instagram" width={28} height={28} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
