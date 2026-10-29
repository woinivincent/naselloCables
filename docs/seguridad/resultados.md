# Resultados antes / después (retest local)

Entorno: build de producción (`next build`, export estático) servido por **Apache 2.4.58 local con el `.htaccess`
del repo**, HTTPS con certificado local. "Antes" = `main` (`e12afcf`); "después" = rama `fix/seguridad-rendimiento`.
No se hicieron pruebas contra producción. Las cifras locales no incluyen la latencia real del hosting.

## Peso de las páginas

Bytes transferidos (navegador real, caché desactivada, 8 s desde la navegación):

| Página | Antes | Después | Reducción |
|--------|------:|--------:|----------:|
| `/` (home) | 36,3 MB | 4,7 MB | −87 % |
| `/empresa/` | 37,5 MB | 4,8 MB | −87 % |
| `/productos/` | 3,1 MB | 1,1 MB | −64 % |
| `/calidad/` | 4,4 MB | 0,8 MB | −82 % |
| `/contacto/` | 413 KB | 434 KB | +5 % (JS de Next 15.5) |

Antes, en home y empresa el video seguía bajando más allá de los 8 s (archivo completo: 52,7 MB).
Después, el video completo pesa 4,3 MB y empieza a bajar **recién después del evento `load`**.

Hasta el evento `load` con red 4G lenta simulada (1,6 Mbps, 150 ms de latencia):

| Página | Antes | Después |
|--------|------:|--------:|
| `/` | 1,7 MB · 9,3 s | 283 KB · 1,9 s |
| `/empresa/` | 4,8 MB · 24,6 s | 686 KB · 4,1 s |
| `/calidad/` | 4,3 MB · 22,1 s | 254 KB · 1,8 s |
| `/productos/` | 229 KB · 1,6 s | 228 KB · 1,6 s |
| `/contacto/` | 227 KB · 1,6 s | 226 KB · 1,6 s |

Tamaño total del export (`out/`): **75 MB → 18 MB** (`assets/`: 67 MB → 8,8 MB).

Medios:

| Archivo | Antes | Después |
|---------|------:|--------:|
| `Video_slider.mp4` | 52,7 MB (1080p, 13,6 Mbps, con audio) | 4,3 MB (720p, 1,16 Mbps, sin audio, faststart) — SSIM 0,96 |
| Poster del video | — | 41 KB (WebP) |
| Sliders (3) | 133–143 KB JPG | 20–23 KB WebP (+ JPG de respaldo 38–41 KB) |
| `foto_derecha-calidad.jpg` | 3,4 MB (3076 px) | 161 KB (1200 px) |
| `imagen-encabezado-empresa.jpg` | 2,1 MB (6997 px) | 93 KB (2400 px) |
| Todos los JPG del sitio | 14,2 MB | 2,5 MB |

## Lighthouse 12.8.2 (local)

Móvil (preset por defecto, throttling simulado) — **mediana de 3 corridas**:

| Página | Perf. antes | Perf. después | LCP antes | LCP después | TBT antes | TBT después | Peso antes | Peso después |
|--------|-----:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|
| `/` | 92 | 91 | 3,3 s | 3,5 s | 92 ms | 56 ms | 28,3 MB | 4,7 MB |
| `/empresa/` | 90 | 91 | 3,5 s | 3,5 s | 110 ms | 69 ms | 26,4 MB | 0,6 MB |
| `/productos/` | 92 | 93 | 3,4 s | 3,2 s | 64 ms | 64 ms | 2,5 MB | 0,8 MB |
| `/calidad/` | 96 | 97 | 2,8 s | 2,6 s | 68 ms | 48 ms | 4,1 MB | 0,6 MB |

Escritorio (1 corrida): home 99 → 100, empresa 99 → 99, productos 97 → 100, calidad 100 → 100.
Accesibilidad / Buenas prácticas / SEO: sin cambios (90 / 100 / 100 en home; productos 93 en buenas prácticas
por el 404 de `/api/products.php`, que en local no existe porque no hay PHP).

Lectura honesta de estos números:

- El puntaje de rendimiento **local** casi no cambia porque el LCP de las páginas es un fondo CSS o un párrafo de
  texto que espera al JavaScript, no el video ni las fotos pesadas. La mejora real es de **bytes** (−80 a −98 %) y de
  **estabilidad**: en "antes", una de las corridas del home dio 55 (TBT 2,9 s) y una de empresa 59 (LCP 15 s),
  por la competencia con el video; en "después" las corridas quedaron todas entre 89 y 92.
- La diferencia de LCP en el home (3,3 → 3,5 s) está dentro de la variación entre corridas (antes: 2,9–3,6 s).
  Se descartó que fuera por el video (bloqueándolo da igual) y por Next 15.5 (con 15.0.3 da igual).
- En producción, con la latencia real y conexiones móviles, el efecto de bajar de ~37 MB a ~5 MB en home/empresa
  debería notarse mucho más. Repetir Lighthouse / PageSpeed Insights contra producción después de desplegar.

## Seguridad

| Ítem | Antes | Después |
|------|-------|---------|
| Credenciales en `db.php` | En texto plano en el repo público | Fuera del repo (env o archivo fuera de `public_html`) — **falta rotar** |
| Acceso directo a `/api/db.php`, configs y backups en `/api/` | Sin bloqueo | 403 (verificado en Apache local) |
| HSTS, CSP, XFO, XCTO, Referrer-Policy, Permissions-Policy | Ninguna | Las 6 (verificado con `curl` en Apache local) |
| Violaciones de CSP | — | 0 en 7 páginas públicas + 9 de admin (incluida importación de PDF) |
| `ServerSignature` | On | Off |
| `ServerTokens` / versión en `Server:` | Visible | **Sigue visible** — solo lo cambia el hosting |
| `npm audit` | 35 (2 críticas, 22 altas) | 9 (0 críticas, 3 altas; todas sin uso en el sitio publicado o solo de build) |
| robots.txt / sitemap.xml | No existen | Generados en el export (18 URLs, todas 200) |
| PHP2Shell | Expuesto (PHP 8.1) | Mitigación parcial (`.user.ini`) — **falta actualizar PHP** |
| HTTP/2 | HTTP/1.1 | Sin cambio — depende del hosting |

## Validación funcional

- Texto renderizado idéntico a `main` en `/`, `/empresa/`, `/productos/`, `/productos/soldadura/`, `/calidad/`, `/contacto/`, `/pedidos/`.
- Capturas de página completa comparadas visualmente: mismo layout.
- Sin imágenes rotas; los sliders cargan los WebP; el video se reproduce (720p) en home y empresa.
- Panel admin (API simulada): dashboard, productos, medios, precios, usuarios y catálogos cargan; el worker de pdfjs carga e importa un PDF.
