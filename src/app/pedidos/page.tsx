'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Trash2 } from 'lucide-react';
import InfoLegend from '@/components/InfoLegend';
import rawCatalog from '@/data/cable_catalog.json';
import Image from 'next/image';

interface OrderItem {
  category: string;   // product slug (e.g. "subterraneos") — used for price lookup
  code: string;
  type: string;
  color: string;
  quantity: number;   // envases
  presentation: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}


const WHATSAPP_NUMBER = '5492323610622';

// ── DB types ──────────────────────────────────────────────────────────────────

type DBProduct = {
  id: number;
  product_code: string;
  name: string;
  category: string;
  codes: string;
  colors: string;
  presentation: string;
};

type CatalogItem = {
  category: string;
  name: string;
  codes: string[];
  colors: string[];
  presentation: string[];
};

type RawCatalogEntry = {
  name: string;
  codes: string[];
  colors: string[];
  presentation: string[];
};

function buildCatalogItemsFromJSON(): CatalogItem[] {
  const catalog = rawCatalog as { cable_catalog: Record<string, RawCatalogEntry> };
  return Object.entries(catalog.cable_catalog).map(([category, c]) => ({
    category,
    name: c.name,
    codes: c.codes,
    colors: c.colors,
    presentation: c.presentation,
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const cleanOptions = (arr?: string[]) =>
  (arr ?? [])
    .map((s) => (s ?? '').trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== 'no disponible');

const defaultMetersByLabel: Record<string, number> = {
  bobina: 1000,
  rollo: 100,
  bobinita: 300,
};

const parseMetersFromPresentation = (presentation: string): number | null => {
  if (!presentation) return null;
  const p = presentation.toLowerCase().replace(',', '.').trim();
  const m = p.match(/(\d+(\.\d+)?)(\s*)(m|mts|mt)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
};

const getMetersPerPack = (item: OrderItem): number => {
  const fromText = parseMetersFromPresentation(item.presentation);
  if (fromText != null) return fromText;

  const pres = item.presentation.toLowerCase();
  const type = item.type.toUpperCase();

  if (type.includes('SOLDADURA GOMA')) {
    if (pres.includes('rollo'))    return 25;
    if (pres.includes('bobinita')) return 100;
    if (pres.includes('bobina'))   return 500;
  }

  if (pres.includes('bobina'))   return defaultMetersByLabel.bobina;
  if (pres.includes('bobinita')) return defaultMetersByLabel.bobinita;
  if (pres.includes('rollo'))    return defaultMetersByLabel.rollo;

  return 100;
};

const buildWhatsappMessage = (customer: CustomerInfo, its: OrderItem[]) => {
  const lines: string[] = [];
  lines.push('Hola, quiero realizar un pedido.');
  if (customer.name)  lines.push(`Nombre/Empresa: ${customer.name}`);
  if (customer.phone) lines.push(`Teléfono: ${customer.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  if (customer.notes) lines.push(`Notas: ${customer.notes}`);
  lines.push('');
  lines.push('Detalle:');
  its.forEach((it, idx) => {
    const metersPerPack = getMetersPerPack(it);
    const totalMeters   = it.quantity * metersPerPack;
    lines.push(
      `${idx + 1}) ${it.type} | Código: ${it.code} | Color: ${it.color || '—'} | Pres: ${it.presentation} | Cant: ${it.quantity} | Total: ${totalMeters}m`
    );
  });
  return lines.join('\n');
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const { toast } = useToast();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    category:     '',
    code:         '',
    type:         '',
    color:        '',
    quantity:     0,
    presentation: '',
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', email: '', phone: '', notes: '',
  });

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(buildCatalogItemsFromJSON);
  const [submitting,   setSubmitting]   = useState(false);

  // Preview stats for the current item being built
  const [previewMeters, setPreviewMeters] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/products.php')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: DBProduct[]) => {
        setCatalogItems(
          data.map((p) => ({
            category:     p.category,
            name:         p.name,
            codes:        JSON.parse(p.codes),
            colors:       JSON.parse(p.colors),
            presentation: JSON.parse(p.presentation),
          }))
        );
      })
      .catch(() => {}); // fall back to JSON
  }, []);

  useEffect(() => {
    if (currentItem.quantity > 0 && currentItem.presentation) {
      setPreviewMeters(getMetersPerPack(currentItem) * currentItem.quantity);
    } else {
      setPreviewMeters(null);
    }
  }, [currentItem]);

  const findCable = (name: string) => catalogItems.find((c) => c.name === name);
  const cableTypes = catalogItems.map((c) => c.name);

  const availableColors = useMemo(
    () => (currentItem.type ? cleanOptions(findCable(currentItem.type)?.colors) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentItem.type, catalogItems]
  );
  const requiresColor = availableColors.length > 0;

  const canAdd =
    !!currentItem.type &&
    !!currentItem.code &&
    !!currentItem.presentation &&
    currentItem.quantity > 0 &&
    (!requiresColor || !!currentItem.color);

  const addItem = () => {
    if (!canAdd) {
      toast({ title: 'Error', description: 'Completá tipo, sección, presentación y cantidad', variant: 'destructive' });
      return;
    }
    const itemToAdd: OrderItem = requiresColor
      ? currentItem
      : { ...currentItem, color: currentItem.color || 'SIN COLOR' };

    setItems((prev) => [...prev, itemToAdd]);
    setCurrentItem({
      category:     currentItem.category,
      type:         currentItem.type,
      code:         '',
      color:        requiresColor ? '' : 'SIN COLOR',
      quantity:     0,
      presentation: '',
    });
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  // ── Submit: calculate price → route ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast({ title: 'Error', description: 'Completá nombre y email', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Error', description: 'Agregá al menos un producto', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch('/api/calculate-order.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          items: items.map((i) => ({
            category:     i.category,
            code:         i.code,
            quantity:     i.quantity,
            presentation: i.presentation,
          })),
        }),
      });
      const { is_wholesale } = await res.json() as {
        total: number; is_wholesale: boolean;
      };

      if (is_wholesale) {
        // Mayorista (>$3M) → email
        await enviarPorEmail(items);
      } else {
        // Minorista (≤$3M) → WhatsApp
        const msg = buildWhatsappMessage(customerInfo, items);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        toast({ title: 'Pedido enviado', description: 'Te redirigimos a WhatsApp.' });
      }
    } catch {
      // Si falla el cálculo de precio, enviar por email
      await enviarPorEmail(items);
    } finally {
      setSubmitting(false);
    }
  };

  const enviarPorEmail = async (itemsToSend: OrderItem[]) => {
    try {
      const res = await fetch('/enviar-pedido.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: {
            nombre:   customerInfo.name,
            email:    customerInfo.email,
            telefono: customerInfo.phone,
            mensaje:  customerInfo.notes,
          },
          pedido: itemsToSend.map((item) => {
            const metrosPorEnvase = getMetersPerPack(item);
            const totalMetros     = item.quantity * metrosPorEnvase;
            return {
              codigo:          item.code,
              color:           item.color,
              descripcion:     item.type,
              tipoEnvase:      item.presentation,
              cantidadEnvases: item.quantity,
              metrosPorEnvase,
              totalMetros,
              obsParticular:   '',
              obsFacturacion:  '',
            };
          }),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Pedido enviado', description: 'Nos pondremos en contacto a la brevedad.' });
        setItems([]);
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error de red', description: 'No se pudo conectar con el servidor', variant: 'destructive' });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[1400px] px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Realizar Pedido</h1>

        <div className="flex flex-row gap-6">
          <div className="flex-1 space-y-8">

            {/* Datos del cliente */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Image src="/icons/icono_Pedidos_Info_ (1).svg" alt="Datos" width={24} height={24} className="mr-2" />
                <h2 className="text-xl font-semibold">Información de Contacto</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Nombre completo o de tu empresa"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                  className="bg-gray-200"
                />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                  className="bg-gray-200"
                />
                <Input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="bg-gray-200"
                />
                <Textarea
                  placeholder="Notas adicionales"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  rows={2}
                  className="bg-gray-200"
                />
              </div>
            </div>

            {/* Agregar productos */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Image src="/icons/icono_Pedidos_Agrgar-producto_.svg" alt="Agregar" width={24} height={24} className="mr-2" />
                <h2 className="text-xl font-semibold">Agregar Productos</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {/* Tipo */}
                <Select
                  value={currentItem.type}
                  onValueChange={(value) => {
                    const cable  = findCable(value);
                    const colors = cleanOptions(cable?.colors);
                    setCurrentItem({
                      ...currentItem,
                      category:     cable?.category ?? '',
                      type:         value,
                      code:         '',
                      presentation: '',
                      color:        colors.length ? '' : 'SIN COLOR',
                    });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    {cableTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sección */}
                <Select
                  value={currentItem.code}
                  onValueChange={(value) => setCurrentItem({ ...currentItem, code: value })}
                  disabled={!currentItem.type}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar sección" /></SelectTrigger>
                  <SelectContent>
                    {(findCable(currentItem.type)?.codes ?? []).map((code) => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Color */}
                <Select
                  value={currentItem.color}
                  onValueChange={(value) => setCurrentItem({ ...currentItem, color: value })}
                  disabled={!currentItem.type || availableColors.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={availableColors.length ? 'Seleccionar color' : 'Sin colores'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Presentación */}
                <Select
                  value={currentItem.presentation}
                  onValueChange={(value) => setCurrentItem({ ...currentItem, presentation: value })}
                  disabled={!currentItem.type}
                >
                  <SelectTrigger><SelectValue placeholder="Presentación" /></SelectTrigger>
                  <SelectContent>
                    {(findCable(currentItem.type)?.presentation ?? []).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Cantidad */}
                <Input
                  type="number"
                  value={currentItem.quantity || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value, 10) || 0 })}
                  min={1}
                  placeholder="Cantidad"
                  className="bg-gray-200"
                />
              </div>

              {/* Preview metro */}
              {previewMeters !== null && (
                <div className="mt-4 flex gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Total del ítem</div>
                    <div className="text-sm font-semibold">{previewMeters} m</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">m / envase</div>
                    <div className="text-sm font-semibold">{getMetersPerPack(currentItem)} m</div>
                  </div>
                </div>
              )}

              <Button className="mt-4 p-2 hover:bg-secondary" onClick={addItem} disabled={!canAdd}>
                <p className="text-xs">AGREGAR ÍTEM</p>
              </Button>
            </div>

            {/* Carrito */}
            {items.length > 0 && (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Pedido ({items.length} ítem{items.length !== 1 ? 's' : ''})</h2>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="hidden md:table-cell">Presentación</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.code}</TableCell>
                        <TableCell>{item.color || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell">{item.presentation}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button
                  className="mt-6 bg-primary hover:bg-secondary text-white w-full sm:w-auto"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Procesando…' : 'Enviar pedido'}
                </Button>
              </div>
            )}
          </div>

          <div className="w-[350px] hidden lg:block">
            <InfoLegend />
          </div>
        </div>
      </div>
    </div>
  );
}
