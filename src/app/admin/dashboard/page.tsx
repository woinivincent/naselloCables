'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  DollarSign,
  Users,
  ImageIcon,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  FileText,
} from 'lucide-react';

type Stats = {
  products: number;
  prices: number;
  users: number;
};

const BRAND = '#009CDE';

const quickLinks = [
  {
    href:    '/admin/products',
    icon:    Package,
    title:   'Productos',
    desc:    'Editar catálogo de cables',
    color:   'bg-blue-50',
    border:  'border-blue-200',
    iconBg:  'bg-[#009CDE]',
  },
  {
    href:    '/admin/prices',
    icon:    DollarSign,
    title:   'Precios',
    desc:    'Gestionar listas de proveedores',
    color:   'bg-emerald-50',
    border:  'border-emerald-200',
    iconBg:  'bg-emerald-500',
  },
  {
    href:    '/admin/media',
    icon:    ImageIcon,
    title:   'Media',
    desc:    'Logos e imágenes del sitio',
    color:   'bg-violet-50',
    border:  'border-violet-200',
    iconBg:  'bg-violet-500',
  },
  {
    href:    '/admin/users',
    icon:    Users,
    title:   'Usuarios',
    desc:    'Administrar accesos al panel',
    color:   'bg-amber-50',
    border:  'border-amber-200',
    iconBg:  'bg-amber-500',
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products.php',       { credentials: 'include' }).then(r => r.json()).catch(() => []),
      fetch('/api/product-prices.php', { credentials: 'include' }).then(r => r.json()).catch(() => []),
      fetch('/api/users.php',          { credentials: 'include' }).then(r => r.json()).catch(() => []),
    ]).then(([products, prices, users]) => {
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        prices:   Array.isArray(prices)   ? prices.length   : 0,
        users:    Array.isArray(users)    ? users.length    : 0,
      });
    });
  }, []);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Image
          src="/assets/logo.png"
          alt="Nasello Cables"
          width={140}
          height={60}
          className="object-contain"
          priority
        />
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Panel de administración</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bienvenido al sistema de gestión de Nasello Cables</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Package}
          label="Productos"
          value={stats?.products}
          iconColor="text-[#009CDE]"
          iconBg="bg-blue-50"
          href="/admin/products"
        />
        <StatCard
          icon={DollarSign}
          label="Precios cargados"
          value={stats?.prices}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          href="/admin/prices"
        />
        <StatCard
          icon={Users}
          label="Usuarios activos"
          value={stats?.users}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          href="/admin/users"
        />
      </div>

      {/* ── Quick access ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(({ href, icon: Icon, title, desc, color, border, iconBg }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 p-4 rounded-xl border ${border} ${color} hover:shadow-md transition-all group`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Info strip ── */}
      <div
        className="rounded-xl p-5 flex flex-wrap gap-6"
        style={{ background: 'linear-gradient(135deg, #009CDE 0%, #0077b6 100%)' }}
      >
        <InfoItem icon={TrendingUp}   label="Lista de precios"   value="Actualizada al 29/01/2026" />
        <InfoItem icon={ShoppingCart} label="Umbral mayorista"   value="Pedidos > $3.000.000 ARS" />
        <InfoItem icon={FileText}     label="Proveedores"        value="Nasello · Wireflex · Conduelec" />
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  iconColor: string;
  iconBg: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex items-center gap-4 group"
    >
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5 leading-none">
          {value !== undefined ? value : <span className="text-gray-300 text-2xl">—</span>}
        </p>
      </div>
    </Link>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-white">
      <Icon className="w-5 h-5 opacity-80 flex-shrink-0" />
      <div>
        <p className="text-xs opacity-70 leading-none">{label}</p>
        <p className="text-sm font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
}
