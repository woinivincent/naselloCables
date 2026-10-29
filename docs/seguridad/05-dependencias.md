# 05 — Dependencias

## npm

| | Antes | Después |
|---|---|---|
| `npm audit` total | 35 (2 críticas, 22 altas, 7 moderadas, 4 bajas) | 9 (0 críticas, 3 altas, 3 moderadas, 3 bajas) |

Cambios:

| Paquete | Antes | Después | Nota |
|---------|-------|---------|------|
| `next` | 15.0.3 | **15.5.28** (fijada) | Último parche de la rama 15. Corrige la vulnerabilidad crítica. |
| `eslint-config-next` | 15.0.3 | 15.5.28 | Acompaña a `next`. |
| `pdfjs-dist` | 6.0.227 | 6.4.299 | Corrige "ejecución de JavaScript arbitrario al abrir un PDF malicioso" (lo usa `/admin/catalogs`). |
| `axios`, `form-data`, transitivas | — | `npm audit fix` | Sin cambios de versión mayor. |
| `react-router-dom`, `zod` | instaladas | **eliminadas** | No se usan en el código (verificado con búsqueda y build). |
| `react` / `react-dom` | 18.3.1 | 18.3.1 | Ya es la última de la rama 18. Pasar a 19 es un cambio mayor (fuera de alcance). Sin vulnerabilidades reportadas. |

Verificación: `next build` OK; mismas rutas exportadas; el texto renderizado de las 7 páginas públicas es idéntico al
de `main`; sin errores JS ni de CSP en el sitio público ni en `/admin/*`; la importación de PDF en
`/admin/catalogs` sigue funcionando (worker de pdfjs).

### Pendientes y por qué

| Paquete | Severidad | Por qué no se actualizó | Riesgo real en producción |
|---------|-----------|-------------------------|---------------------------|
| `nodemailer` 6.10.1 | alta | El arreglo es la 10.x (cambio mayor). | **Ninguno en el sitio publicado**: solo lo usa `src/app/api/enviar-pedido/route.ts`, que en el export estático se reemplaza por un stub. Los pedidos por mail van a `/enviar-pedido.php` (servidor). Recomendación: eliminar esa ruta, `nodemailer` y `exceljs` si no se usan en desarrollo. |
| `exceljs` (→ `uuid`) | moderada | `npm audit` propone *bajar* a 3.4.0 (cambio mayor hacia atrás). | Igual que arriba: solo en la ruta de desarrollo. |
| `next` (→ `postcss` 8.4.31 interno) | moderada / alta | El arreglo es Next 16 (cambio mayor). | Bajo: `postcss` corre en el build, no en el navegador ni en el servidor (el sitio es estático). |
| `@svgr/webpack` (→ `svgo`, `deepmerge`) | baja | El "arreglo" propuesto es bajar a 5.4.0. | Solo en build. |
| `brace-expansion` (vía `eslint` 8) | alta (ReDoS) | Requiere ESLint 9 (cambio mayor). | Solo en desarrollo. |

Nota: varias vulnerabilidades de Next.js (Server Actions, middleware, servidor de desarrollo) no aplican al sitio
publicado porque es un export estático servido por Apache, sin servidor Node.

## PHP: "PHP2Shell" (CVE-2026-109618 y CVE-2026-109619)

**Verificado: son reales.** Lo confirma el archivo de noticias oficial de PHP (php.net/archive/2026.php) y el anuncio
de release en php.announce (PHP 8.4.27). Desde este entorno no se pudo abrir directamente php.net ni NVD (bloqueados
por la red de la sesión); la información oficial se obtuvo mediante búsqueda restringida a esos dominios y coincide
con Qualys, Unit 42 (Palo Alto), watchTowr, BleepingComputer y el NCSC de Países Bajos.

- CVE-2026-109618 (GHSA-w8hw-w9fx-j79w): RCE por corrupción de memoria al quedarse sin memoria (OOM).
- CVE-2026-109619 (GHSA-6wmf-4rv5-p3rp): RCE por estado global que sobrevive entre requests (use-after-free, ligado a `session.upload_progress`).
- Severidad según PHP: CVSS v4.0 9.2 (crítica). Pre-autenticación. Afecta a toda instalación que sirva requests web (PHP-FPM, mod_php, CGI, LiteSpeed).
- **Versiones corregidas (21/10/2026): 8.5.12, 8.4.27, 8.3.36, 8.2.35.**
- **PHP 8.1 (la del servidor) no tiene parche oficial** (fuera de soporte). Existen backports de terceros/distribuciones, de calidad variable.
- Hay reportes (no oficiales) de explotación activa; las fuentes no coinciden del todo en ese punto.
- PHP indica que no hay mitigación completa: **actualizar es la única solución**.

### Mitigación parcial aplicada en esta rama

`public/.user.ini` con `session.upload_progress.enabled = 0` (recomendado por el proyecto PHP como medida parcial).
El sitio no usa esa función (verificado en el código), así que no tiene impacto funcional. Funciona si PHP corre como
PHP-FPM/CGI (lo habitual en cPanel); con mod_php se ignora. El `.htaccess` bloquea la lectura de `.user.ini` (403).
Para comprobar que se aplicó en el servidor: crear temporalmente un `info.php` con `<?php phpinfo();`, buscar
`session.upload_progress.enabled` (columna *Local value* = Off) y **borrarlo enseguida**.

Esto **no** reemplaza la actualización de PHP: ver el mensaje al hosting en `checklist-externo.md`.
