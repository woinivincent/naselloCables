"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

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

    // Construir la URL mailto con los datos del formulario
    const mailtoLink = `mailto:ventas@nasellocables.com.ar?subject=Consulta de ${formData.nombre}&body=Nombre: ${formData.nombre}%0AEmail: ${formData.email}%0ATeléfono: ${formData.telefono}%0AMensaje: ${formData.mensaje}`;

    // Intentar abrir el cliente de correo del usuario
    window.location.href = mailtoLink;

    // Mostrar el mensaje de éxito (opcional)
    toast({
      title: "Correo abierto",
      description: "Se ha abierto tu cliente de correo con los datos del formulario. Puedes enviarlo manualmente.",
    });

    // Limpiar el formulario
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
      <div className="container py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">CONTÁCTANOS</h1>

        <div className="grid gap-12 md:grid-cols-2 ">
          {/* Información de Contacto */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold">
              Información de Contacto
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Dirección</h3>
                  <p> Luján, Buenos Aires</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Teléfono</h3>
                  <p>(+54) 9 2323 35-4771</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>info@nasellocables.com.ar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Horario de Atención</h3>
                  <p>Lunes a Viernes: 8:30 - 16:30</p>
                </div>
              </div>
            </div>


          </div>

          {/* Formulario de Contacto */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Envíenos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nombre" className="mb-2 block font-medium">
                  Nombre
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                />
              </div>

              <Button type="submit" className="w-full bg-primary sm:w-auto">
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
