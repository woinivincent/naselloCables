import type { MetadataRoute } from 'next';
import catalog from '@/data/cable_catalog.json';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Public routes only: /admin and /api are excluded on purpose.
const STATIC_ROUTES = ['/', '/empresa/', '/productos/', '/calidad/', '/contacto/', '/pedidos/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const products = Object.keys(catalog.cable_catalog).map((id) => `/productos/${id}/`);

  return [...STATIC_ROUTES, ...products].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/productos/') && path !== '/productos/' ? 0.8 : 0.6,
  }));
}
