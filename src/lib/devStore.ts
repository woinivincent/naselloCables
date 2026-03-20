// DEV ONLY — in-memory product store for local API route mocks.
// Initialized from cable_catalog.json so the admin panel has real data to work with.
// Changes persist for the lifetime of the dev server process (lost on restart).

import rawCatalog from '@/data/cable_catalog.json';

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

type CatalogEntry = {
  id?: string;
  name: string;
  description: string;
  use?: string;
  slug?: string;
  images: unknown;
  codes: unknown;
  colors: unknown;
  presentation: unknown;
  technical_specs: unknown;
};

function initFromJSON(): DBProduct[] {
  const catalog = rawCatalog as { cable_catalog: Record<string, CatalogEntry> };
  return Object.entries(catalog.cable_catalog).map(([category, entry], index) => ({
    id:              index + 1,
    product_code:    entry.id ?? category.toUpperCase().slice(0, 5),
    name:            entry.name,
    description:     entry.description,
    category,
    slug:            entry.slug ?? null,
    use_text:        entry.use ?? null,
    images:          JSON.stringify(entry.images ?? []),
    codes:           JSON.stringify(entry.codes ?? []),
    colors:          JSON.stringify(entry.colors ?? []),
    presentation:    JSON.stringify(entry.presentation ?? []),
    technical_specs: JSON.stringify(entry.technical_specs ?? []),
  }));
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type DevUserRole = 'admin' | 'editor';

export type DevUser = {
  id: number;
  username: string;
  password: string; // plain-text for dev only — PHP uses password_hash in prod
  role: DevUserRole;
  email: string;
  created_at: string;
};

type ResetToken = {
  userId: number;
  expires: number; // unix ms
  used: boolean;
};

// In-memory token store for dev — keyed by token string
const resetTokens = new Map<string, ResetToken>();

// Seed: one admin. Up to 4 more can be created via the panel.
const users: DevUser[] = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'webadmin@nasellocables.com', created_at: new Date().toISOString() },
];
let nextUserId = 2;

export const devUsers = {
  getAll: (): Omit<DevUser, 'password'>[] =>
    users.map(({ password: _pw, ...u }) => u),

  findByUsername: (username: string): DevUser | undefined =>
    users.find((u) => u.username === username),

  findByEmail: (email: string): DevUser | undefined =>
    users.find((u) => u.email === email),

  create: (data: { username: string; password: string; role: DevUserRole; email: string }): { ok: boolean; error?: string } => {
    if (users.find((u) => u.username === data.username)) {
      return { ok: false, error: 'El usuario ya existe' };
    }
    if (users.length >= 5) {
      return { ok: false, error: 'Máximo 5 usuarios permitidos' };
    }
    users.push({ ...data, id: nextUserId++, created_at: new Date().toISOString() });
    return { ok: true };
  },

  update: (id: number, data: { username?: string; password?: string; role?: DevUserRole; email?: string }): { ok: boolean; error?: string } => {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado' };
    if (data.username && data.username !== users[idx].username) {
      if (users.find((u) => u.username === data.username)) {
        return { ok: false, error: 'El nombre de usuario ya existe' };
      }
    }
    // Prevent removing the last admin
    if (data.role && data.role !== 'admin' && users[idx].role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) return { ok: false, error: 'Debe haber al menos un administrador' };
    }
    Object.assign(users[idx], data);
    return { ok: true };
  },

  remove: (id: number, requesterId: number): { ok: boolean; error?: string } => {
    if (id === requesterId) return { ok: false, error: 'No podés eliminarte a vos mismo' };
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado' };
    if (users[idx].role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) return { ok: false, error: 'Debe haber al menos un administrador' };
    }
    users.splice(idx, 1);
    return { ok: true };
  },
};

// ─── Password reset tokens ────────────────────────────────────────────────────

export const devResetTokens = {
  /** Creates a token valid for 1 hour. Returns the token string. */
  create: (userId: number): string => {
    // Simple random token for dev — prod uses bin2hex(random_bytes(32)) in PHP
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    resetTokens.set(token, { userId, expires: Date.now() + 60 * 60 * 1000, used: false });
    return token;
  },

  verify: (token: string): { ok: boolean; userId?: number } => {
    const entry = resetTokens.get(token);
    if (!entry || entry.used || entry.expires < Date.now()) return { ok: false };
    return { ok: true, userId: entry.userId };
  },

  consume: (token: string): boolean => {
    const entry = resetTokens.get(token);
    if (!entry || entry.used || entry.expires < Date.now()) return false;
    entry.used = true;
    return true;
  },
};

// ─── Technical files ──────────────────────────────────────────────────────────

export type DevFile = {
  id: number;
  product_category: string;
  label: string;
  url: string;
};

const techFiles: DevFile[] = [];
let nextFileId = 1;

export const devFiles = {
  getByCategory: (category: string): DevFile[] =>
    techFiles.filter((f) => f.product_category === category),

  create: (data: { product_category: string; label: string; url: string }): DevFile => {
    const entry: DevFile = { id: nextFileId++, ...data };
    techFiles.push(entry);
    return entry;
  },

  remove: (id: number): boolean => {
    const idx = techFiles.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    techFiles.splice(idx, 1);
    return true;
  },
};

// ─── Price store (per-meter, keyed by category::CODE) ─────────────────────────

export type DevProductPrice = {
  product_category: string;
  code: string;
  price_per_meter: number;
  supplier: string;
};

// Seed with real prices from Excel lists (Nasello/Wireflex/Conduelec)
const initialPrices: DevProductPrice[] = [
  // subterraneos — Conduelec
  {product_category:'subterraneos',code:'S16',price_per_meter:5598.22,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S25',price_per_meter:10222.59,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S35',price_per_meter:14522.01,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S50',price_per_meter:19396.94,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S70',price_per_meter:27007.66,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S95',price_per_meter:31756.49,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S120',price_per_meter:44718.51,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S150',price_per_meter:55817.35,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S185',price_per_meter:77451.03,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S240',price_per_meter:101802.25,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S2X1.5',price_per_meter:1982.61,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S2X2.5',price_per_meter:2996.36,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S2X4',price_per_meter:3986.75,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S2X6',price_per_meter:6033.38,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S2X10',price_per_meter:8605.89,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S2X16',price_per_meter:13246.04,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X1.5',price_per_meter:2627.89,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X2.5',price_per_meter:3852.14,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X4',price_per_meter:5410.03,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X6',price_per_meter:8760.45,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X10',price_per_meter:12235.10,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X16',price_per_meter:19723.13,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X25',price_per_meter:32885.22,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X25+16',price_per_meter:37751.96,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X35',price_per_meter:45147.01,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X35+16',price_per_meter:51545.04,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X50',price_per_meter:62459.44,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S3X50+25',price_per_meter:72495.90,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X1.5',price_per_meter:3035.03,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X2.5',price_per_meter:5068.05,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X4',price_per_meter:7750.00,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X6',price_per_meter:11876.59,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X10',price_per_meter:15777.93,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X16',price_per_meter:25493.41,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X25',price_per_meter:44872.42,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S4X35',price_per_meter:62826.25,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S5X1.5',price_per_meter:3895.24,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S5X2.5',price_per_meter:7234.40,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S5X4',price_per_meter:9612.90,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S5X6',price_per_meter:14858.86,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S5x10',price_per_meter:21602.00,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S7X1.5',price_per_meter:5529.27,supplier:'Conduelec'},
  {product_category:'subterraneos',code:'S7x2.5',price_per_meter:9245.30,supplier:'Conduelec'},
  // tipo_taller_tpr — Conduelec
  {product_category:'tipo_taller_tpr',code:'2x0.75',price_per_meter:922.49,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'2X1',price_per_meter:1058.27,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'2x1.5',price_per_meter:1525.75,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'2x2.5',price_per_meter:2439.36,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'2x4',price_per_meter:3473.98,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'2X6',price_per_meter:5410.36,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'2X10',price_per_meter:10032.72,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3X0.75',price_per_meter:1210.20,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3x1',price_per_meter:1469.20,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3x1.5',price_per_meter:2063.20,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3x2.5',price_per_meter:3449.43,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3x4',price_per_meter:5107.89,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3X6',price_per_meter:7830.32,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'3X10',price_per_meter:10849.88,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4x0.75',price_per_meter:1569.43,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4x1',price_per_meter:1766.03,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4x1.5',price_per_meter:2677.63,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4x2.5',price_per_meter:4632.23,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4x4',price_per_meter:6535.61,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4X6',price_per_meter:10497.70,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4X10',price_per_meter:14511.27,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4X16',price_per_meter:25415.56,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'4X25',price_per_meter:44395.02,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'5X1',price_per_meter:2397.96,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'5X1.5',price_per_meter:3536.61,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'5X2.5',price_per_meter:6048.24,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'5X4',price_per_meter:9150.64,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'5X6',price_per_meter:13564.01,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'5X10',price_per_meter:19478.33,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'6X1',price_per_meter:2843.19,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'7X1',price_per_meter:3279.83,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'7X1.5',price_per_meter:5419.45,supplier:'Conduelec'},
  {product_category:'tipo_taller_tpr',code:'7X2.5',price_per_meter:8317.68,supplier:'Conduelec'},
  // soldadura — Nasello
  {product_category:'soldadura',code:'G16',price_per_meter:6923.97,supplier:'Nasello'},
  {product_category:'soldadura',code:'G25',price_per_meter:11522.39,supplier:'Nasello'},
  {product_category:'soldadura',code:'G35',price_per_meter:16347.13,supplier:'Nasello'},
  {product_category:'soldadura',code:'G50',price_per_meter:22982.35,supplier:'Nasello'},
  {product_category:'soldadura',code:'G70',price_per_meter:31000.82,supplier:'Nasello'},
  {product_category:'soldadura',code:'G95',price_per_meter:39604.57,supplier:'Nasello'},
  {product_category:'soldadura',code:'G120',price_per_meter:51846.86,supplier:'Nasello'},
  {product_category:'soldadura',code:'G150',price_per_meter:63308.78,supplier:'Nasello'},
  // bomba_sumergible — Conduelec
  {product_category:'bomba_sumergible',code:'BS2X1.5',price_per_meter:1458.17,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS2X2.5',price_per_meter:2354.47,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X1.5',price_per_meter:2112.41,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X2.5',price_per_meter:3375.61,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X4',price_per_meter:4961.16,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X6',price_per_meter:7797.05,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X10',price_per_meter:11469.36,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X16',price_per_meter:18558.32,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X25',price_per_meter:33188.24,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS3X35',price_per_meter:47019.73,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS4x1.5',price_per_meter:2918.51,supplier:'Conduelec'},
  {product_category:'bomba_sumergible',code:'BS4x2.5',price_per_meter:4714.38,supplier:'Conduelec'},
  // unipolar_antillama — Conduelec
  {product_category:'unipolar_antillama',code:'0.75',price_per_meter:294.79,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'1',price_per_meter:358.24,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'1.5',price_per_meter:545.24,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'2.5',price_per_meter:915.00,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'4',price_per_meter:1348.41,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'6',price_per_meter:2162.20,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'10',price_per_meter:3092.00,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'16',price_per_meter:5151.45,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'25',price_per_meter:9483.59,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'35',price_per_meter:13209.63,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'50',price_per_meter:18124.02,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'70',price_per_meter:25133.23,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'95',price_per_meter:33241.19,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'120',price_per_meter:42824.84,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'150',price_per_meter:58108.40,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'185',price_per_meter:72613.66,supplier:'Conduelec'},
  {product_category:'unipolar_antillama',code:'240',price_per_meter:89337.49,supplier:'Conduelec'},
  // bipolar_vaina_plana — Wireflex
  {product_category:'bipolar_vaina_plana',code:'VP2X1',price_per_meter:791.62,supplier:'Wireflex'},
  {product_category:'bipolar_vaina_plana',code:'VP2X1.5',price_per_meter:1174.88,supplier:'Wireflex'},
  {product_category:'bipolar_vaina_plana',code:'VP2X2.5',price_per_meter:929.43,supplier:'Wireflex'},
  {product_category:'bipolar_vaina_plana',code:'VP3X1',price_per_meter:1394.14,supplier:'Wireflex'},
  {product_category:'bipolar_vaina_plana',code:'VP3X1.5',price_per_meter:1347.03,supplier:'Wireflex'},
  // automotor_bateria — Conduelec
  {product_category:'automotor_bateria',code:'AUT10',price_per_meter:3461.70,supplier:'Conduelec'},
  {product_category:'automotor_bateria',code:'AUT16',price_per_meter:5697.67,supplier:'Conduelec'},
  {product_category:'automotor_bateria',code:'AUT25',price_per_meter:10400.66,supplier:'Conduelec'},
  {product_category:'automotor_bateria',code:'AUT35',price_per_meter:14850.63,supplier:'Conduelec'},
  {product_category:'automotor_bateria',code:'AUT50',price_per_meter:21003.26,supplier:'Conduelec'},
  {product_category:'automotor_bateria',code:'AUT70',price_per_meter:28515.20,supplier:'Conduelec'},
  {product_category:'automotor_bateria',code:'AUT95',price_per_meter:36451.74,supplier:'Conduelec'},
  // cable_cobre_desnudo — Conduelec
  {product_category:'cable_cobre_desnudo',code:'DES6',price_per_meter:1953.51,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES10',price_per_meter:2732.01,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES16',price_per_meter:4646.84,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES25',price_per_meter:8539.35,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES35',price_per_meter:12233.62,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES50',price_per_meter:16440.44,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES70',price_per_meter:22968.26,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES95',price_per_meter:30463.16,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES120',price_per_meter:39166.92,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES150',price_per_meter:48354.22,supplier:'Conduelec'},
  {product_category:'cable_cobre_desnudo',code:'DES200',price_per_meter:60442.78,supplier:'Conduelec'},
  // bafle_audio_premium — Wireflex
  {product_category:'bafle_audio_premium',code:'BA2x1',price_per_meter:780.06,supplier:'Wireflex'},
  {product_category:'bafle_audio_premium',code:'BA2x1.5',price_per_meter:901.74,supplier:'Wireflex'},
  // bipolar_cristal_paralelos — Conduelec
  {product_category:'bipolar_cristal_paralelos',code:'CRIS2X0.75',price_per_meter:620.20,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'CRIS2X1',price_per_meter:753.95,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'CRIS2X1.5',price_per_meter:1133.86,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'CRIS2X2.5',price_per_meter:1900.36,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'PAR2X0.75',price_per_meter:588.89,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'PAR2X1',price_per_meter:716.48,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'PAR2X1.5',price_per_meter:1090.48,supplier:'Conduelec'},
  {product_category:'bipolar_cristal_paralelos',code:'PAR2X2.5',price_per_meter:1793.54,supplier:'Conduelec'},
  // soldadura_azul — Conduelec
  {product_category:'soldadura_azul',code:'A16',price_per_meter:5805.40,supplier:'Conduelec'},
  {product_category:'soldadura_azul',code:'A25',price_per_meter:10407.58,supplier:'Conduelec'},
  {product_category:'soldadura_azul',code:'A35',price_per_meter:14938.73,supplier:'Conduelec'},
  {product_category:'soldadura_azul',code:'A50',price_per_meter:21003.26,supplier:'Conduelec'},
  {product_category:'soldadura_azul',code:'A70',price_per_meter:28515.20,supplier:'Conduelec'},
  {product_category:'soldadura_azul',code:'A95',price_per_meter:36451.74,supplier:'Conduelec'},
  {product_category:'soldadura_azul',code:'A120',price_per_meter:47308.40,supplier:'Conduelec'},
  // subterraneos — Nasello (CS prefix)
  {product_category:'subterraneos',code:'CS16',price_per_meter:9057.88,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS25',price_per_meter:13434.73,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS35',price_per_meter:18183.36,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS50',price_per_meter:27156.75,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS70',price_per_meter:36823.00,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS95',price_per_meter:48094.66,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS120',price_per_meter:61951.87,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS150',price_per_meter:76299.15,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS185',price_per_meter:92488.42,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS240',price_per_meter:123025.98,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS2X1.5',price_per_meter:2805.24,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS2X2.5',price_per_meter:3819.18,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS2X4',price_per_meter:5559.78,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS2X6',price_per_meter:7841.15,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS2X10',price_per_meter:12437.69,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS2X16',price_per_meter:19602.88,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X1.5',price_per_meter:3717.79,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X2.5',price_per_meter:5154.21,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X4',price_per_meter:7874.95,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X6',price_per_meter:11001.27,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X10',price_per_meter:17101.82,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X16',price_per_meter:27782.02,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X25',price_per_meter:45661.20,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X35',price_per_meter:62991.13,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS3X50',price_per_meter:82885.59,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS4X1.5',price_per_meter:4528.94,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS4X2.5',price_per_meter:6252.64,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS4X4',price_per_meter:9852.14,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS4X6',price_per_meter:13569.93,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS4X10',price_per_meter:21377.28,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS4X16',price_per_meter:34136.05,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS5X1.5',price_per_meter:6100.55,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS5X2.5',price_per_meter:8466.42,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS5X4',price_per_meter:12944.66,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS5X6',price_per_meter:17963.68,supplier:'Nasello'},
  {product_category:'subterraneos',code:'CS5X10',price_per_meter:29319.83,supplier:'Nasello'},
  // subterraneos — Wireflex (TS prefix)
  {product_category:'subterraneos',code:'TS2x1.5',price_per_meter:1292.59,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS2x2.5',price_per_meter:2088.36,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS2x4',price_per_meter:2929.27,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS2x6',price_per_meter:4127.92,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS3x2.5',price_per_meter:2779.73,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS4x2.5',price_per_meter:3193.44,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS4x4',price_per_meter:5164.88,supplier:'Wireflex'},
  {product_category:'subterraneos',code:'TS4x6',price_per_meter:7159.90,supplier:'Wireflex'},
  // tipo_taller_tpr — Nasello (C prefix)
  {product_category:'tipo_taller_tpr',code:'C2X1',price_per_meter:1625.18,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C2X1.5',price_per_meter:2250.28,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C2X2.5',price_per_meter:3531.73,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C2X4',price_per_meter:5156.91,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C3X1',price_per_meter:2156.49,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C3X1.5',price_per_meter:3000.42,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C3X2.5',price_per_meter:4691.34,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C3X4',price_per_meter:6938.41,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C4X1',price_per_meter:2750.32,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C4X1.5',price_per_meter:3813.10,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C4X2.5',price_per_meter:5907.06,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C4X4',price_per_meter:9170.09,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C5X1.5',price_per_meter:5289.40,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C5X2.5',price_per_meter:9007.19,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C7X1.5',price_per_meter:8212.93,supplier:'Nasello'},
  {product_category:'tipo_taller_tpr',code:'C7X2.5',price_per_meter:12184.20,supplier:'Nasello'},
  // tipo_taller_tpr — Wireflex (T prefix)
  {product_category:'tipo_taller_tpr',code:'T2x1',price_per_meter:948.68,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T2x1.5',price_per_meter:1073.19,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T2x2.5',price_per_meter:1583.75,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T2x4',price_per_meter:2520.52,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T2x6',price_per_meter:3576.14,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T3x1',price_per_meter:1254.55,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T3x1.5',price_per_meter:1485.50,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T3x2.5',price_per_meter:2147.12,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T3X4',price_per_meter:3532.50,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T3x6',price_per_meter:5228.58,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T4x1',price_per_meter:1636.71,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T4x1.5',price_per_meter:1812.56,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T4x2.5',price_per_meter:2772.65,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T4x4',price_per_meter:4740.33,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T4x6',price_per_meter:6724.22,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T5x1',price_per_meter:2146.99,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T5x1.5',price_per_meter:2528.88,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T5x2.5',price_per_meter:3680.14,supplier:'Wireflex'},
  {product_category:'tipo_taller_tpr',code:'T7x1.5',price_per_meter:3397.38,supplier:'Wireflex'},
  // unipolar_antillama — Nasello (C prefix)
  {product_category:'unipolar_antillama',code:'C0.75',price_per_meter:381.26,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C1',price_per_meter:534.18,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C1.5',price_per_meter:737.72,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C2.5',price_per_meter:1177.97,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C4',price_per_meter:1882.37,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C6',price_per_meter:2778.38,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C10',price_per_meter:4922.77,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C16',price_per_meter:7725.01,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C25',price_per_meter:12349.82,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C35',price_per_meter:17642.59,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C50',price_per_meter:24961.00,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C70',price_per_meter:34860.46,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C95',price_per_meter:44531.21,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C120',price_per_meter:59102.69,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C150',price_per_meter:73750.52,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C185',price_per_meter:92921.85,supplier:'Nasello'},
  {product_category:'unipolar_antillama',code:'C240',price_per_meter:113300.98,supplier:'Nasello'},
  // unipolar_antillama — Wireflex (T prefix, flexible)
  {product_category:'unipolar_antillama',code:'T1',price_per_meter:264.14,supplier:'Wireflex'},
  {product_category:'unipolar_antillama',code:'T1.5',price_per_meter:332.22,supplier:'Wireflex'},
  {product_category:'unipolar_antillama',code:'T2.5',price_per_meter:561.05,supplier:'Wireflex'},
  {product_category:'unipolar_antillama',code:'T4',price_per_meter:960.93,supplier:'Wireflex'},
  {product_category:'unipolar_antillama',code:'T6',price_per_meter:1461.12,supplier:'Wireflex'},
  {product_category:'unipolar_antillama',code:'T10',price_per_meter:2403.90,supplier:'Wireflex'},
  // bipolar_cristal_paralelos — Wireflex (TCRIS/TPAR prefix)
  {product_category:'bipolar_cristal_paralelos',code:'TCRIS2x1',price_per_meter:553.60,supplier:'Wireflex'},
  {product_category:'bipolar_cristal_paralelos',code:'TCRIS2x1.5',price_per_meter:714.72,supplier:'Wireflex'},
  {product_category:'bipolar_cristal_paralelos',code:'TPAR2x1',price_per_meter:518.00,supplier:'Wireflex'},
  {product_category:'bipolar_cristal_paralelos',code:'TPAR2x1.5',price_per_meter:664.44,supplier:'Wireflex'},
  {product_category:'bipolar_cristal_paralelos',code:'TPAR2x2.5',price_per_meter:1122.11,supplier:'Wireflex'},
  // cable_cobre_desnudo — Nasello (CU4R prefix)
  {product_category:'cable_cobre_desnudo',code:'CU4R6',price_per_meter:2575.66,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R10',price_per_meter:3769.26,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R16',price_per_meter:6596.21,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R25',price_per_meter:11370.61,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R35',price_per_meter:16270.65,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R50',price_per_meter:22615.57,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R70',price_per_meter:30782.31,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R95',price_per_meter:39577.25,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R120',price_per_meter:50885.04,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R150',price_per_meter:62821.04,supplier:'Nasello'},
  {product_category:'cable_cobre_desnudo',code:'CU4R185',price_per_meter:78526.29,supplier:'Nasello'},
];

// Case-insensitive lookup key: CATEGORY::CODE (both uppercased, commas→periods)
const normalizeKey = (cat: string, code: string) =>
  `${cat.toUpperCase()}::${code.toUpperCase().replace(/,/g, '.')}`;

const priceMap = new Map<string, DevProductPrice>();
initialPrices.forEach((p) => priceMap.set(normalizeKey(p.product_category, p.code), { ...p }));

export const devProductPrices = {
  getAll: (): DevProductPrice[] => Array.from(priceMap.values()),

  getByCategory: (category: string): DevProductPrice[] =>
    Array.from(priceMap.values()).filter((p) => p.product_category === category),

  getPrice: (category: string, code: string): number =>
    priceMap.get(normalizeKey(category, code))?.price_per_meter ?? 0,

  set: (category: string, code: string, price: number, supplier = ''): void => {
    const key = normalizeKey(category, code);
    const existing = priceMap.get(key);
    priceMap.set(key, {
      product_category: category,
      code,
      price_per_meter: price,
      supplier: supplier || existing?.supplier || '',
    });
  },
};

// ─── Products ─────────────────────────────────────────────────────────────────

// Module-level singleton — survives across requests within the same process
const products: DBProduct[] = initFromJSON();
let nextId = products.length + 1;

export const devStore = {
  getAll: (): DBProduct[] => [...products],

  findById: (id: number): DBProduct | undefined =>
    products.find((p) => p.id === id),

  findByCategory: (category: string): DBProduct | undefined =>
    products.find((p) => p.category === category),

  create: (data: Partial<DBProduct>): number => {
    const id = nextId++;
    products.push({
      id,
      product_code:    data.product_code    ?? '',
      name:            data.name            ?? '',
      description:     data.description     ?? '',
      category:        data.category        ?? '',
      slug:            data.slug            ?? null,
      use_text:        data.use_text        ?? null,
      images:          data.images          ?? '[]',
      codes:           data.codes           ?? '[]',
      colors:          data.colors          ?? '[]',
      presentation:    data.presentation    ?? '[]',
      technical_specs: data.technical_specs ?? '[]',
    });
    return id;
  },

  update: (id: number, data: Partial<DBProduct>): boolean => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products[idx] = {
      ...products[idx],
      product_code:    data.product_code    ?? products[idx].product_code,
      name:            data.name            ?? products[idx].name,
      description:     data.description     ?? products[idx].description,
      category:        data.category        ?? products[idx].category,
      slug:            data.slug            ?? products[idx].slug,
      use_text:        data.use_text        ?? products[idx].use_text,
      images:          data.images          ?? products[idx].images,
      codes:           data.codes           ?? products[idx].codes,
      colors:          data.colors          ?? products[idx].colors,
      presentation:    data.presentation    ?? products[idx].presentation,
      technical_specs: data.technical_specs ?? products[idx].technical_specs,
    };
    return true;
  },

  remove: (id: number): boolean => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },
};
