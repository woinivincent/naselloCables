"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Send, Trash2, Loader2 } from "lucide-react";

// Importar el catálogo
import cableCatalog from '../../../data/cable_catalog.json';

interface OrderItem {
  code: string;
  type: string;
  color: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function PedidosPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    code: "",
    type: "",
    color: "",
    quantity: 0,
  });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Extraer los tipos de cable del catálogo
  const cableTypes = Object.values(cableCatalog.cable_catalog).map(cable => cable.name);

  // Función para obtener los códigos disponibles basados en el tipo seleccionado
  const getAvailableCodes = (selectedType: string) => {
    const selectedCable = Object.values(cableCatalog.cable_catalog).find(
      cable => cable.name === selectedType
    );
    return selectedCable?.codes || [];
  };

  // Función para obtener los colores disponibles basados en el tipo seleccionado
  const getAvailableColors = (selectedType: string) => {
    const selectedCable = Object.values(cableCatalog.cable_catalog).find(
      cable => cable.name === selectedType
    );
    return selectedCable?.colors || [];
  };

  const handleTypeChange = (value: string) => {
    setCurrentItem({ 
      ...currentItem, 
      type: value,
      code: "", // Resetear el código cuando cambia el tipo
      color: "" // Resetear el color cuando cambia el tipo
    });
  };

  const handleCodeChange = (value: string) => {
    setCurrentItem({ 
      ...currentItem, 
      code: value
    });
  };

  const addItem = () => {
    if (!currentItem.type || !currentItem.code || !currentItem.quantity) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos del producto",
        variant: "destructive",
      });
      return;
    }
    setItems([...items, currentItem]);
    setCurrentItem({
      code: "",
      type: "",
      color: "",
      quantity: 0,
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un ítem al pedido",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos de contacto",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('${window.location.origin}/api/send-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items,
          customerInfo 
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el pedido');
      }

      toast({
        title: "Pedido enviado",
        description: "Nos pondremos en contacto contigo pronto para confirmar tu pedido.",
      });
      setItems([]);
      setCustomerInfo({
        name: "",
        email: "",
        phone: "",
        notes: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el pedido. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

 
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Realizar Pedido</h1>

        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          {/* Información de contacto */}
          <div className="rounded-lg border p-6 bg-card">
            <h2 className="mb-4 text-xl font-semibold">Información de Contacto</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Nombre</label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Teléfono</label>
                <Input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="Número de teléfono"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Notas adicionales</label>
                <Textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Agrega cualquier información adicional sobre tu pedido"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Agregar productos */}
          <div className="rounded-lg border p-6 bg-card">
            <h2 className="mb-4 text-xl font-semibold">Agregar Productos</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Tipo</label>
                <Select
                  value={currentItem.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Código</label>
                <Select
                  value={currentItem.code}
                  onValueChange={handleCodeChange}
                  disabled={!currentItem.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar código" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCodes(currentItem.type).map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Color</label>
                <Select
                  value={currentItem.color}
                  onValueChange={(value) => setCurrentItem({ ...currentItem, color: value })}
                  disabled={!currentItem.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableColors(currentItem.type).map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Cantidad (metros)</label>
                <Input
                  type="number"
                  value={currentItem.quantity || ""}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={addItem}
              className="mt-4"
              variant="secondary"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar al Pedido
            </Button>
          </div>

          {/* Resumen del pedido */}
          {items.length > 0 && (
            <div className="rounded-lg border p-6 bg-card">
              <h2 className="mb-4 text-xl font-semibold">Resumen del Pedido</h2>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell>{item.quantity} m</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Button type="submit" className="mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Enviar Pedido
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}