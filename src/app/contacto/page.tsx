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
    <div className="flex justify-center max-sm:p-4">
      <div className="container py-8">
        <h1 className="mb-12 text-center text-4xl font-bold">CONTACTO</h1>

        <div className="grid gap-12 md:grid-cols-2 ">
          {/* Información de Contacto */}
          <div>
            <h2 className="mb-6 text-1xl font-semibold">
              Información de Contacto
            </h2>
            <div className="space-y-7">
              <div className="flex items-start gap-4">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <p> Luján, Buenos Aires</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-8 w-8 text-primary" />
                <div>

                  <p>(+54) 9 2323 35-4771</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-8 w-8 text-primary" />
                <div>

                  <p>recepcion@nasellocables.com.ar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-8 w-8 text-primary" />
                <div>

                  <p>Lunes a Viernes: 9:00 - 16:00</p>
                </div>
              </div>
            </div>


          </div>

          {/* Formulario de Contacto */}
          <div>
            <h2 className="mb-2 text-1xl font-semibold">Enviar un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nombre" className="mb-2 block font-light">
                  Nombre
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="bg-gray-200"
                />
              </div>

              <div>
                <label htmlFor="email" className=" block font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-200"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="mb-2 block font-medium">
                  Teléfono
                </label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="bg-gray-200"
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="mb-2 block font-medium">
                  Mensaje
                </label>
                <Textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="bg-gray-200"
                />
              </div>

              <Button type="submit" className="w-full text-xs bg-primary hover:bg-secondary  sm:w-auto">
                ENVIAR MENSAJE
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
