"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Empresa", href: "/empresa" },
    { name: "Calidad", href: "/calidad" },
    { name: "Contacto", href: "/contacto" },
    { name: "Pedidos", href: "/pedidos" },
  ];

  return (
    <header className="relative bg-white shadow-sm ">
      <div className="bg-primary py-2" >
        <div className="container mx-auto flex justify-end gap-6 text-sm text-white max-sm:px-2">
          <a href="tel:+542323354771" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>(+54) 9 2323 35-4771</span>
          </a>
          <a href="mailto:recepcion@nasellocables.com.ar" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>recepcion@nasellocables.com.ar</span>
          </a>
        </div>
      </div>

      <nav className="container max-h[100px] mx-2 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex-shrink-0 max-h-fit">
              <Image
                src="/assets/logo.png"
                width={185}
                height={26}
                alt="logo"
                className="overflow-hidden"
              />
            </div>
          </Link>
          <div className="hidden md:block">
            <div className="ml-2 flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2"
            >
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;