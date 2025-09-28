"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import MapPin from "@/icons/icono_Contacto_Ubicacion_.svg";
import Phone from "@/icons/icono_Contacto_Telefono_.svg";
import Mail from "@/icons/icono_Contacto_Mail_.svg";
import Clock from "@/icons/icono_Contacto_Horario_.svg";
import WhatsApp from "@/icons/whatsapp.svg";
import Image from "next/image";
export default function ContactoPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mailtoLink = `mailto:ventas@nasellocables.com.ar?subject=Consulta de ${formData.nombre}&body=Nombre: ${formData.nombre}%0AEmail: ${formData.email}%0ATeléfono: ${formData.telefono}%0AMensaje: ${formData.mensaje}`;

    window.location.href = mailtoLink;

    toast({
      title: "Correo abierto",
      description: "Se ha abierto tu cliente de correo con los datos del formulario. Puedes enviarlo manualmente.",
    });

    setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-12 text-center text-3xl sm:text-4xl font-bold">CONTACTO</h1>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Formulario - Primero en mobile */}
        <div className="order-1 md:order-2">
          <h2 className="mb-2 text-xl md:text-2xl font-semibold">Enviar un Mensaje</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="mb-2 block font-medium">Nombre</label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="bg-gray-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="mb-2 block font-medium">Teléfono</label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="bg-gray-200 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="mensaje" className="mb-2 block font-medium">Mensaje</label>
              <Textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                rows={5}
                required
                className="bg-gray-200 text-sm sm:text-base"
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto text-sm sm:text-base bg-primary hover:bg-secondary">
              ENVIAR MENSAJE
            </Button>
          </form>
        </div>

        {/* Información de Contacto - Segundo en mobile */}
        <div className="order-2 md:order-1">
          <h2 className="mb-6 text-xl md:text-2xl font-semibold">Información de Contacto</h2>
          <div className="space-y-7">
            <div className="flex items-start gap-4">
              <Image
                src="/icons/icono_Contacto_Ubicacion_.svg"
                alt="Ubicación"
                width={32}
                height={32}
                className="sm:w-8 sm:h-8 w-6 h-6"
              />
              <p>Luján, Buenos Aires</p>
            </div>

            <div className="flex items-start gap-4">
              <Image
                src="/icons/icono_Contacto_Telefono_.svg"
                alt="Teléfono"
                width={32}
                height={32}
                className="sm:w-8 sm:h-8 w-6 h-6"
              />
              <p>2323 422757 / 429457 - 2323 610622</p>
            </div>

            <div className="flex items-start gap-4">
              <Image
                src="/icons/whatsapp.svg"
                alt="WhatsApp"
                width={32}
                height={32}
                className="sm:w-8 sm:h-8 w-6 h-6"
              />
              <p>(+54) 9 2323 -610622</p>
            </div>

            <div className="flex items-start gap-4">
              <Image
                src="/icons/icono_Contacto_Mail_.svg"
                alt="Correo"
                width={32}
                height={32}
                className="sm:w-8 sm:h-8 w-6 h-6"
              />
              <p>recepcion@nasellocables.com.ar</p>
            </div>

            <div className="flex items-start gap-4">
              <Image
                src="/icons/icono_Contacto_Horario_.svg"
                alt="Horario"
                width={32}
                height={32}
                className="sm:w-8 sm:h-8 w-6 h-6"
              />
              <p>Lunes a Viernes: 8:30 -16:30</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}