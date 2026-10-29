# 02 — Cabeceras de seguridad y versión de Apache (H1, H7)

## Qué se agregó en `public/.htaccess`

| Cabecera | Valor | Nota |
|----------|-------|------|
| `Strict-Transport-Security` | `max-age=300` | Solo se envía por HTTPS. Valor corto a propósito (ver "Subir HSTS"). |
| `Content-Security-Policy` | todo `'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests` | Ver "CSP" abajo. |
| `X-Frame-Options` | `DENY` | |
| `X-Content-Type-Options` | `nosniff` | Se agregó `AddType text/javascript .mjs` para que el worker de pdfjs no quede bloqueado. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | |
| `ServerSignature Off` | — | Quita la versión de las páginas de error generadas por Apache. |
| `Options -Indexes` | — | Desactiva el listado de directorios. |

`ServerTokens Prod` **no se puede** poner en `.htaccess`: probado en Apache 2.4.58 local, devuelve
**500** con `ServerTokens not allowed here`. Lo tiene que configurar el hosting (checklist externo).
Hasta entonces la cabecera `Server:` va a seguir mostrando la versión.

## CSP

Se relevó lo que carga el sitio: no hay scripts, iframes, fuentes ni imágenes de terceros.
YouTube, Instagram, WhatsApp, IRAM y Certipedia son solo **enlaces** (la CSP no restringe navegación).
La fuente Inter la descarga `next/font` en el build y se sirve desde `/_next/static/media/`.

Concesiones necesarias (deuda técnica a reducir más adelante):

- `script-src 'unsafe-inline'`: el export estático de Next.js inserta scripts inline en cada HTML
  (`self.__next_f.push(...)`). Para quitarlo habría que calcular hashes por página en el build y
  servirlos por página (no es viable con un único `.htaccess` estático sin tooling adicional).
- `style-src 'unsafe-inline'`: atributos `style` de React / framer-motion.
- `worker-src blob:` y `img-src blob: data:`: pdfjs y previsualizaciones en `/admin`.

Validación local (Apache 2.4.58 + build de producción): sin violaciones de CSP ni errores JS en
`/`, `/empresa/`, `/productos/`, `/productos/<id>/`, `/calidad/`, `/contacto/`, `/pedidos/` y todas las
páginas de `/admin/*` (con la API simulada), incluida la importación de un PDF en `/admin/catalogs/`
(el worker de pdfjs carga desde `/_next/static/media/*.mjs`).

**Si al desplegar algo deja de funcionar**: abrir DevTools → Consola y buscar
`Refused to ... because it violates the following Content Security Policy directive`. Como plan B
inmediato, cambiar `Content-Security-Policy` por `Content-Security-Policy-Report-Only` (mismo valor):
el navegador solo informa y no bloquea.

## Si el `.htaccess` da error 500 en el hosting

Algunos hostings no permiten ciertas directivas en `.htaccess` (`AllowOverride` restringido).
Revisar cPanel → *Métricas → Errores*; si el mensaje dice `... not allowed here`, comentar con `#`
esa línea (`Options -Indexes`, `ServerSignature Off` o `AddType`) y avisar al hosting.

## Subir HSTS

1. Desplegar con `max-age=300` y navegar el sitio completo por HTTPS (incluidos `/admin` y formularios).
2. Si todo funciona por una semana, pasar a `max-age=604800`; luego `2592000` (1 mes); luego `31536000` (1 año).
3. `includeSubDomains` solo si **todos** los subdominios (`webmail.`, `cpanel.`, `mail.`, etc.) tienen HTTPS válido.
4. `preload` solo después del paso 3 y si se va a inscribir el dominio en https://hstspreload.org.

## Cómo validarlo en producción

1. Entrar a https://securityheaders.com/?q=https%3A%2F%2Fwww.nasellocables.com&followRedirects=on
   (marcar **Hide results** si no se quiere que el resultado aparezca en el listado público).
   Esperado: las seis cabeceras en verde. La nota máxima puede quedar limitada por `'unsafe-inline'`
   en la CSP (aviso esperado).
2. Por consola (desde cualquier PC):
   ```bash
   curl -sI https://www.nasellocables.com/ | grep -iE "strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|^server"
   ```
3. Verificar que `curl -sI http://www.nasellocables.com/` **no** devuelva `Strict-Transport-Security`
   (solo debe ir por HTTPS) y que redirija a HTTPS.
4. Verificar `https://www.nasellocables.com/api/db.php` → **403**.
5. Abrir el sitio con DevTools → Consola en cada sección y en `/admin`, y confirmar que no aparezcan errores de CSP.
6. Opcional: https://observatory.mozilla.org para un segundo análisis.
