'use client';

import { useMemo, useState } from 'react';
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
import rawCatalog from '@/data/cable_catalog.json';
import Image from 'next/image';

interface OrderItem {
  code: string;
  type: string;
  color: string;
  quantity: number; // envases
  presentation: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

type ItemEval = {
  item: OrderItem;
  sectionMm2: number | null;
  metersPerPack: number;
  totalMeters: number;
  minWholesaleMeters: number | null;
  missingMeters: number | null;
  isWholesaleItem: boolean;
  reason: string;
};

type SplitResult = {
  wholesaleItems: OrderItem[];
  retailItems: OrderItem[];
  evals: ItemEval[];
  mode: 'WHOLESALE_ONLY' | 'RETAIL_ONLY' | 'MIXED' | 'EMPTY';
};

const WHATSAPP_NUMBER = '54911XXXXXXXX';

// ---------- Types for API catalog ----------
type DBProduct = {
  id: number;
  product_code: string;
  name: string;
  description: string;
  category: string;
  slug: string | null;
  use_text: string | null;
  images: string;
  codes: string;
  colors: string;
  presentation: string;
  technical_specs: string;
};

type CatalogItem = {
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
  return Object.values(catalog.cable_catalog).map((c) => ({
    name: c.name,
    codes: c.codes,
    colors: c.colors,
    presentation: c.presentation,
  }));
}

// ---------- Helpers ----------
const cleanOptions = (arr?: string[]) =>
  (arr ?? [])
    .map((s) => (s ?? '').trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== 'no disponible');

const parseMainSectionMm2 = (code: string): number | null => {
  if (!code) return null;
  const c = code.trim().toUpperCase().replace(',', '.');

  const xMatch = c.match(/X\s*(\d+(\.\d+)?)/);
  if (xMatch) {
    const n = Number(xMatch[1]);
    return Number.isFinite(n) ? n : null;
  }

  const nMatch = c.match(/(\d+(\.\d+)?)/);
  if (!nMatch) return null;

  const n = Number(nMatch[1]);
  return Number.isFinite(n) ? n : null;
};

const getMinWholesaleMeters = (sectionMm2: number): number => {
  if (sectionMm2 < 4) return 1500;
  if (sectionMm2 > 16) return 100;
  return 500;
};

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
    if (pres.includes('rollo')) return 25;
    if (pres.includes('bobinita')) return 100;
    if (pres.includes('bobina')) return 500;
  }

  if (pres.includes('bobina')) return defaultMetersByLabel.bobina;
  if (pres.includes('bobinita')) return defaultMetersByLabel.bobinita;
  if (pres.includes('rollo')) return defaultMetersByLabel.rollo;

  return 100;
};

const evaluateItem = (item: OrderItem): ItemEval => {
  const sectionMm2 = parseMainSectionMm2(item.code);
  const metersPerPack = getMetersPerPack(item);
  const totalMeters = item.quantity * metersPerPack;

  if (sectionMm2 == null) {
    return {
      item,
      sectionMm2,
      metersPerPack,
      totalMeters,
      minWholesaleMeters: null,
      missingMeters: null,
      isWholesaleItem: false,
      reason: `No se pudo leer sección desde "${item.code}".`,
    };
  }

  const minWholesaleMeters = getMinWholesaleMeters(sectionMm2);
  const missingMeters = Math.max(0, minWholesaleMeters - totalMeters);
  const isWholesaleItem = totalMeters >= minWholesaleMeters;

  return {
    item,
    sectionMm2,
    metersPerPack,
    totalMeters,
    minWholesaleMeters,
    missingMeters,
    isWholesaleItem,
    reason: isWholesaleItem
      ? 'Califica mayorista'
      : `No califica mayorista (faltan ${missingMeters}m)`,
  };
};

const splitOrder = (items: OrderItem[]): SplitResult => {
  if (items.length === 0) {
    return { wholesaleItems: [], retailItems: [], evals: [], mode: 'EMPTY' };
  }

  const evals = items.map(evaluateItem);
  const wholesaleItems = evals.filter((e) => e.isWholesaleItem).map((e) => e.item);
  const retailItems = evals.filter((e) => !e.isWholesaleItem).map((e) => e.item);

  let mode: SplitResult['mode'] = 'MIXED';
  if (wholesaleItems.length > 0 && retailItems.length === 0) mode = 'WHOLESALE_ONLY';
  if (retailItems.length > 0 && wholesaleItems.length === 0) mode = 'RETAIL_ONLY';

  return { wholesaleItems, retailItems, evals, mode };
};

const buildWhatsappMessage = (customer: CustomerInfo, its: OrderItem[]) => {
  const lines: string[] = [];
  lines.push('Hola, quiero realizar un pedido.');
  if (customer.name) lines.push(`Nombre/Empresa: ${customer.name}`);
  if (customer.phone) lines.push(`Teléfono: ${customer.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  if (customer.notes) lines.push(`Notas: ${customer.notes}`);
  lines.push('');
  lines.push('Detalle:');

  its.forEach((it, idx) => {
    const metersPerPack = getMetersPerPack(it);
    const totalMeters = it.quantity * metersPerPack;
    lines.push(
      `${idx + 1}) ${it.type} | Código: ${it.code} | Color: ${it.color || '—'} | Pres: ${it.presentation} | Cant: ${it.quantity} | Total: ${totalMeters}m`
    );
  });

  return lines.join('\n');
};
// ----------------------------

function Pill({
  variant,
  title,
  subtitle,
}: {
  variant: 'wholesale' | 'retail' | 'neutral';
  title: string;
  subtitle?: string;
}) {
  const base = 'rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-2';
  const styles =
    variant === 'wholesale'
      ? 'bg-green-100 text-green-800'
      : variant === 'retail'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800';
  return (
    <div className="flex flex-col gap-1">
      <span className={`${base} ${styles}`}>{title}</span>
      {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
    </div>
  );
}

function OrderCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-lg font-semibold">{title}</div>
        {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      </div>
      {children}
    </div>
  );
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

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(buildCatalogItemsFromJSON);

  useEffect(() => {
    fetch('/api/products.php')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data: DBProduct[]) => {
        setCatalogItems(
          data.map((p) => ({
            name: p.name,
            codes: JSON.parse(p.codes),
            colors: JSON.parse(p.colors),
            presentation: JSON.parse(p.presentation),
          }))
        );
      })
      .catch(() => {}); // already initialized from JSON
  }, []);

  const findCableByName = (name: string) =>
    catalogItems.find((c) => c.name === name);

  const cableTypes = catalogItems.map((c) => c.name);

  const getAvailableCodes = (selectedType: string) => {
    const selectedCable = findCableByName(selectedType);
    return selectedCable?.codes ?? [];
  };

  const getAvailablePresentation = (selectedType: string) => {
    const selectedCable = findCableByName(selectedType);
    return selectedCable?.presentation ?? [];
  };

  const getAvailableColors = (selectedType: string) => {
    const selectedCable = findCableByName(selectedType);
    return cleanOptions(selectedCable?.colors);
  };

  const availableColors = useMemo(
    () => (currentItem.type ? getAvailableColors(currentItem.type) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentItem.type, catalogItems]
  );
  const requiresColor = availableColors.length > 0;

  const canPreview =
    !!currentItem.type &&
    !!currentItem.code &&
    !!currentItem.presentation &&
    !!currentItem.quantity &&
    (!requiresColor || !!currentItem.color);

  const currentEval = useMemo(() => (canPreview ? evaluateItem(currentItem) : null), [canPreview, currentItem]);

  const addItem = () => {
    if (!currentItem.type || !currentItem.code || !currentItem.presentation || !currentItem.quantity) {
      toast({
        title: 'Error',
        description: 'Por favor complete tipo, sección, presentación y cantidad',
        variant: 'destructive',
      });
      return;
    }

    if (requiresColor && !currentItem.color) {
      toast({
        title: 'Error',
        description: 'Seleccioná un color',
        variant: 'destructive',
      });
      return;
    }

    const itemToAdd: OrderItem = requiresColor
      ? currentItem
      : { ...currentItem, color: currentItem.color || 'SIN COLOR' };

    setItems((prev) => [...prev, itemToAdd]);
    setCurrentItem({
      code: '',
      type: currentItem.type,
      color: requiresColor ? '' : 'SIN COLOR',
      quantity: 0,
      presentation: '',
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const enviarPedidoConItems = async (itemsToSend: OrderItem[]) => {
    if (!customerInfo.name || !customerInfo.email || itemsToSend.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes completar los datos del cliente y al menos un producto',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/enviar-pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: {
            nombre: customerInfo.name,
            email: customerInfo.email,
            telefono: customerInfo.phone,
            mensaje: customerInfo.notes,
          },
          pedido: itemsToSend.map((item) => {
            const metrosPorEnvase = getMetersPerPack(item);
            const totalMetros = item.quantity * metrosPorEnvase;

            return {
              codigo: item.code,
              color: item.color,
              descripcion: item.type,
              tipoEnvase: item.presentation,
              cantidadEnvases: item.quantity,
              metrosPorEnvase,
              totalMetros,
              precioMetro: 120,
              subtotal: totalMetros * 120,
              obsParticular: '',
              obsFacturacion: '',
            };
          }),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Pedido enviado correctamente.' });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error de red',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      });
    }
  };

  const split = useMemo(() => splitOrder(items), [items]);

  const retailCount = split.retailItems.length;
  const wholesaleCount = split.wholesaleItems.length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[1400px] px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Realizar Pedido</h1>

        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <div className="space-y-8">
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
                    required
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
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div className="flex items-center">
                    <Image src="/icons/icono_Pedidos_Agrgar-producto_.svg" alt="Agregar" width={24} height={24} className="mr-2" />
                    <h2 className="text-xl font-semibold">Agregar Productos</h2>
                  </div>

                  {/* Indicador de clasificación del ítem actual */}
                  {currentEval ? (
                    <Pill
                      variant={currentEval.isWholesaleItem ? 'wholesale' : 'retail'}
                      title={currentEval.isWholesaleItem ? 'Ítem Mayorista' : 'Ítem Minorista'}
                      subtitle={
                        currentEval.isWholesaleItem
                          ? `Total: ${currentEval.totalMeters}m`
                          : `Faltan ${currentEval.missingMeters ?? 0}m`
                      }
                    />
                  ) : (
                    <Pill variant="neutral" title="Completá el ítem para ver el canal" />
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <Select
                    value={currentItem.type}
                    onValueChange={(value) => {
                      const colors = getAvailableColors(value);
                      setCurrentItem({
                        ...currentItem,
                        type: value,
                        code: '',
                        presentation: '',
                        color: colors.length ? '' : 'SIN COLOR',
                      });
                    }}
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
                    onValueChange={(value) => setCurrentItem({ ...currentItem, code: value })}
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
                    onValueChange={(value) => setCurrentItem({ ...currentItem, color: value })}
                    disabled={!currentItem.type || availableColors.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={availableColors.length ? 'Seleccionar color' : 'Sin colores'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentItem.presentation}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, presentation: value })}
                    disabled={!currentItem.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Presentación" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePresentation(currentItem.type).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={currentItem.quantity || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value, 10) || 0 })}
                    min={1}
                    placeholder="Cantidad"
                    className="bg-gray-200"
                  />
                </div>

                {/* Micro-resumen visual (en vez de texto largo) */}
                {currentEval && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Sección</div>
                      <div className="text-sm font-semibold">{currentEval.sectionMm2 ?? '-'} mm²</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">m / envase</div>
                      <div className="text-sm font-semibold">{currentEval.metersPerPack} m</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Total ítem</div>
                      <div className="text-sm font-semibold">{currentEval.totalMeters} m</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Mín mayorista</div>
                      <div className="text-sm font-semibold">{currentEval.minWholesaleMeters ?? '-'} m</div>
                    </div>
                  </div>
                )}

                <Button className="mt-4 p-2 hover:bg-secondary" onClick={addItem}>
                  <p className="text-xs">
                    {currentEval
                      ? currentEval.isWholesaleItem
                        ? 'AGREGAR ÍTEM (MAYORISTA)'
                        : 'AGREGAR ÍTEM (MINORISTA)'
                      : 'AGREGAR ÍTEM'}
                  </p>
                </Button>
              </div>

              {/* Resumen nuevo: 2 tarjetas claras */}
              {items.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <OrderCard
                    title={`Mayorista (Email a fábrica) — ${wholesaleCount} ítem(s)`}
                    description="Los ítems que cumplen el mínimo se envían por email."
                  >
                    {wholesaleCount === 0 ? (
                      <div className="text-sm text-muted-foreground">No hay ítems mayoristas.</div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Código</TableHead>
                              <TableHead className="hidden md:table-cell">Pres.</TableHead>
                              <TableHead>Cant.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {split.wholesaleItems.map((it, idx) => (
                              <TableRow key={`${it.code}-${idx}`}>
                                <TableCell>{it.type}</TableCell>
                                <TableCell>{it.code}</TableCell>
                                <TableCell className="hidden md:table-cell">{it.presentation}</TableCell>
                                <TableCell>{it.quantity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <Button
                          className="mt-4 bg-green-600 text-white hover:bg-green-700 w-full"
                          onClick={() => enviarPedidoConItems(split.wholesaleItems)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Enviar Mayorista por Email
                        </Button>
                      </>
                    )}
                  </OrderCard>

                  <OrderCard
                    title={`Minorista (WhatsApp distribuidor) — ${retailCount} ítem(s)`}
                    description="Los ítems que no cumplen el mínimo se envían por WhatsApp."
                  >
                    {retailCount === 0 ? (
                      <div className="text-sm text-muted-foreground">No hay ítems minoristas.</div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Código</TableHead>
                              <TableHead className="hidden md:table-cell">Pres.</TableHead>
                              <TableHead>Cant.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {split.retailItems.map((it, idx) => (
                              <TableRow key={`${it.code}-${idx}`}>
                                <TableCell>{it.type}</TableCell>
                                <TableCell>{it.code}</TableCell>
                                <TableCell className="hidden md:table-cell">{it.presentation}</TableCell>
                                <TableCell>{it.quantity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <Button
                          className="mt-4 bg-green-600 text-white hover:bg-green-700 w-full"
                          onClick={() => {
                            const msg = buildWhatsappMessage(customerInfo, split.retailItems);
                            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
                            window.open(url, '_blank');
                          }}
                        >
                          Enviar Minorista por WhatsApp
                        </Button>
                      </>
                    )}
                  </OrderCard>

                  {/* Lista completa + borrar (opcional, para mantener funcionalidad original) */}
                  <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Todos los ítems</h2>
                      <div className="text-sm text-muted-foreground">
                        {split.mode === 'MIXED' ? 'Pedido mixto' : split.mode === 'WHOLESALE_ONLY' ? 'Solo mayorista' : 'Solo minorista'}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead className="hidden md:table-cell">Presentación</TableHead>
                          <TableHead>Cant.</TableHead>
                          <TableHead>Canal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, index) => {
                          const ev = split.evals[index];
                          return (
                            <TableRow key={index}>
                              <TableCell>{item.type}</TableCell>
                              <TableCell>{item.code}</TableCell>
                              <TableCell>{item.color || '—'}</TableCell>
                              <TableCell className="hidden md:table-cell">{item.presentation}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell className={ev?.isWholesaleItem ? 'text-green-700' : 'text-yellow-700'}>
                                {ev?.isWholesaleItem ? 'Email' : 'WhatsApp'}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
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
