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
    toast({
      title: "Mensaje enviado",
      description: "Nos pondremos en contacto contigo pronto.",
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
    <div className="flex justify-center">
      <div className="container py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Contáctenos</h1>

        <div className="grid gap-12 md:grid-cols-2">
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
                  <p>J. Saulmer 1008, Luján, Buenos Aires</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Teléfono</h3>
                  <p>(+54) 2323 423-702</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>ventas@nasellocables.com.ar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Horario de Atención</h3>
                  <p>Lunes a Viernes: 9:00 - 16:00</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-semibold">Ubicación</h2>
              <div className="relative h-[300px] overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.0029909511322!2d-59.0954285236379!3d-34.57879087296337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bc87e77d531063%3A0xfdd24c2bf4f40b00!2sNaselo%20cables%20sa!5e0!3m2!1ses-419!2sar!4v1731618066178!5m2!1ses-419!2sar" 
                  width="700px"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
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

              <Button type="submit" className="w-full bg-primary">
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}