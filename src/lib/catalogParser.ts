// Client-side parsing of supplier price lists (catálogos) into { code, price } rows.
// Supports .xlsx (ExcelJS), .csv and .pdf (pdf.js). Heavy libs are dynamically
// imported so they only load when the admin actually parses a file.

export type ParsedRow = {
  code: string;
  price: number;
};

// Words that mark a header/section row, not a price row
const HEADER_WORDS = /^(c[oó]digo|codigo|precio|producto|descripci[oó]n|lista|art[ií]culo|medida|secci[oó]n)$/i;

// A plausible cable code: starts with letter or digit, may contain x, ×, ., +, -, /
const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9.,+xX×/-]*$/;

/**
 * Parses a price in Argentinian or plain format: "1.234,56", "1234.56", "$ 1.234"…
 * Returns NaN if the string is not a number.
 */
export function parsePrice(raw: string): number {
  let s = raw.replace(/[$\s]/g, '').replace(/ARS/gi, '');
  if (s === '' || /[^\d.,-]/.test(s)) return NaN;

  const lastDot   = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  if (lastDot !== -1 && lastComma !== -1) {
    // Both present: the last one is the decimal separator
    if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
    else                     s = s.replace(/,/g, '');
  } else if (lastComma !== -1) {
    // Only comma: decimal if followed by 1–2 digits, otherwise thousands
    const decimals = s.length - lastComma - 1;
    s = decimals <= 2 ? s.replace(',', '.') : s.replace(/,/g, '');
  } else if (lastDot !== -1) {
    // Only dot: thousands separator if followed by exactly 3 digits and there's
    // more than one group (e.g. "1.234.567") — otherwise decimal
    const groups = s.split('.');
    if (groups.length > 2 || (groups.length === 2 && groups[1].length === 3 && groups[0].length <= 3)) {
      // Ambiguous "1.234": price lists here are per-meter ARS, thousands is the safe bet
      s = groups.join('');
    }
  }

  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

/** Picks code (first code-looking cell) and price (last numeric cell) from a row of cells. */
function rowFromCells(cells: string[]): ParsedRow | null {
  let code = '';
  let price = NaN;

  for (const cell of cells) {
    const v = cell.trim();
    if (v === '') continue;
    if (!code && CODE_RE.test(v) && Number.isNaN(parsePrice(v)) && !HEADER_WORDS.test(v)) {
      code = v;
    }
  }
  // Price: last parseable numeric cell
  for (let i = cells.length - 1; i >= 0; i--) {
    const n = parsePrice(cells[i].trim());
    if (!Number.isNaN(n)) { price = n; break; }
  }

  if (!code || Number.isNaN(price)) return null;
  return { code, price };
}

function dedupe(rows: ParsedRow[]): ParsedRow[] {
  const seen = new Map<string, ParsedRow>();
  for (const r of rows) seen.set(r.code.toUpperCase(), r); // last occurrence wins
  return Array.from(seen.values());
}

// ─── XLSX ─────────────────────────────────────────────────────────────────────

export async function parseXlsx(buffer: ArrayBuffer): Promise<ParsedRow[]> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const rows: ParsedRow[] = [];
  workbook.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: false }, (cell) => {
        const v = cell.value;
        if (v === null || v === undefined) return;
        if (typeof v === 'number') cells.push(String(v));
        else if (typeof v === 'object' && 'result' in v) cells.push(String(v.result ?? ''));
        else if (typeof v === 'object' && 'richText' in v) cells.push(v.richText.map((t) => t.text).join(''));
        else cells.push(String(v));
      });
      const parsed = rowFromCells(cells);
      if (parsed) rows.push(parsed);
    });
  });

  return dedupe(rows);
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function parseCsv(text: string): ParsedRow[] {
  const sep = text.includes(';') ? ';' : ',';
  const rows: ParsedRow[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = line.split(sep).map((c) => c.replace(/^"|"$/g, ''));
    const parsed = rowFromCells(cells);
    if (parsed) rows.push(parsed);
  }

  return dedupe(rows);
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function parsePdf(buffer: ArrayBuffer): Promise<ParsedRow[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const rows: ParsedRow[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page    = await doc.getPage(p);
    const content = await page.getTextContent();

    // Group text items into lines by their (rounded) vertical position
    const lines = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push({ x: item.transform[4], str: item.str });
    }

    for (const items of Array.from(lines.values())) {
      const cells = items.sort((a, b) => a.x - b.x).map((i) => i.str);
      const parsed = rowFromCells(cells);
      if (parsed) rows.push(parsed);
    }
  }

  return dedupe(rows);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function parseCatalogFile(file: File): Promise<ParsedRow[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'xlsx') return parseXlsx(await file.arrayBuffer());
  if (ext === 'csv')  return parseCsv(await file.text());
  if (ext === 'pdf')  return parsePdf(await file.arrayBuffer());

  throw new Error('Formato no soportado. Usá PDF, Excel (.xlsx) o CSV.');
}
