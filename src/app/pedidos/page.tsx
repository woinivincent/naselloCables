'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Download } from 'lucide-react';
import InfoLegend from '@/components/InfoLegend';
import cableCatalog from '@/data/cable_catalog.json' assert { type: "json" };
import Agregar from '@/icons/icono_Pedidos_Agrgar-producto_.svg';
import Datos from '@/icons/icono_Pedidos_Info_ (1).svg';

interface OrderItem {
  code: string;
  type: string;
  color: string;
  quantity: number;
  presentation: string;
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
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    code: '',
    type: '',
    color: '',
    quantity: 0,
    presentation: '',
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const cableTypes = Object.values(cableCatalog.cable_catalog).map(
    (cable) => cable.name
  );

  const getAvailableCodes = (selectedType: string) => {
    const selectedCable = Object.values(cableCatalog.cable_catalog).find(
      (cable) => cable.name === selectedType
    );
    return selectedCable?.codes || [];
  };

  const getAvailableColors = (selectedType: string) => {
    const selectedCable = Object.values(cableCatalog.cable_catalog).find(
      (cable) => cable.name === selectedType
    );
    return selectedCable?.colors || [];
  };

  const getAvailablePresentation = (selectedType: string) => {
    const selectedCable = Object.values(cableCatalog.cable_catalog).find(
      (cable) => cable.name === selectedType
    );
    return selectedCable?.presentation || [];
  };

  const addItem = () => {
    if (
      !currentItem.type ||
      !currentItem.code ||
      !currentItem.color ||
      !currentItem.presentation ||
      !currentItem.quantity
    ) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos del producto',
        variant: 'destructive',
      });
      return;
    }
    setItems([...items, currentItem]);
    setCurrentItem({
      code: '',
      type: '',
      color: '',
      quantity: 0,
      presentation: '',
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const enviarPedido = async () => {
    if (!customerInfo.name || !customerInfo.email || items.length === 0) {
      toast({
        title: "Error",
        description: "Debes completar los datos del cliente y al menos un producto",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/enviar-pedido/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            nombre: customerInfo.name,
            email: customerInfo.email,
            telefono: customerInfo.phone,
            mensaje: customerInfo.notes,
          },
          pedido: items.map((item) => ({
            codigo: item.code,
            color: item.color,
            descripcion: item.type,
            tipoEnvase: item.presentation,
            cantidadEnvases: item.quantity,
            metrosPorEnvase: 100,
            totalMetros: item.quantity * 100,
            precioMetro: 120,
            subtotal: item.quantity * 100 * 120,
            obsParticular: "",
            obsFacturacion: "",
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Éxito", description: "Pedido enviado correctamente." });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[1400px] px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Realizar Pedido</h1>
        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <div className="space-y-8">
              {/* Datos del cliente */}
              <div className="border p-6 bg-card">
                <div className="flex items-center mb-4">
                  <Datos className="h-6 mr-2" />
                  <h2 className="mb-3 text-xl font-semibold">
                    Información de Contacto
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Nombre completo o de tu empresa"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    required
                    className='bg-gray-200'
                  />
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, email: e.target.value })
                    }
                    required
                    className='bg-gray-200'
                  />
                  <Input
                    type="tel"
                    placeholder="Número de teléfono"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, phone: e.target.value })
                    }
                    required
                    className='bg-gray-200'
                  />
                  <Textarea
                    placeholder="Notas adicionales"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, notes: e.target.value })
                    }
                    rows={2}
                    className='bg-gray-200 '
                  />
                </div>
              </div>

              {/* Formulario de productos */}
              <div className="border p-6 bg-card">
                <div className="flex items-center mb-4">
                  <Agregar className="h-6 mr-2" />
                  <h2 className="text-xl font-semibold">Agregar Productos</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <Select
                    value={currentItem.type}
                    onValueChange={(value) =>
                      setCurrentItem({
                        ...currentItem,
                        type: value,
                        code: '',
                        color: '',
                        presentation: '',
                      })
                    }
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

                  <Select
                    value={currentItem.code}
                    onValueChange={(value) =>
                      setCurrentItem({ ...currentItem, code: value })
                    }
                    disabled={!currentItem.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCodes(currentItem.type).map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentItem.color}
                    onValueChange={(value) =>
                      setCurrentItem({ ...currentItem, color: value })
                    }
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

                  <Select
                    value={currentItem.presentation}
                    onValueChange={(value) =>
                      setCurrentItem({ ...currentItem, presentation: value })
                    }
                    disabled={!currentItem.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Presentación" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePresentation(currentItem.type).map(
                        (presentation) => (
                          <SelectItem key={presentation} value={presentation}>
                            {presentation}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={currentItem.quantity || ''}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    placeholder="Cantidad"
                    className='bg-gray-200 '
                  />
                </div>
                <Button className="mt-4 p-2 hover:bg-secondary" onClick={addItem}>
                  <p className='text-xs'>AGREGAR PEDIDO</p>
                </Button>
              </div>

              {/* Tabla de resumen */}
              {items.length > 0 && (
                <div className="rounded-lg border p-6 bg-card">
                  <h2 className="mb-4 text-xl font-semibold">Resumen del Pedido</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Sección</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Presentación</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.color}</TableCell>
                          <TableCell>{item.presentation}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    className="mt-4 bg-green-600 text-white hover:bg-green-700"
                    onClick={enviarPedido}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Enviar Pedido por Email
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="w-[350px] hidden lg:block">
            <InfoLegend />
          </div>
        </div>
      </div>
    </div>
  );
}
