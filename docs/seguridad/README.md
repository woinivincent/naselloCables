# Remediación de seguridad y rendimiento (informe 27/10/2026)

Rama: `fix/seguridad-rendimiento`.

| Doc | Contenido |
|-----|-----------|
| [01-credenciales.md](01-credenciales.md) | Secretos encontrados, nueva configuración de `db.php`, rotación de contraseñas |
| [02-cabeceras.md](02-cabeceras.md) | Cabeceras de seguridad, CSP, HSTS, validación con SecurityHeaders.com |
| [05-dependencias.md](05-dependencias.md) | npm audit, versiones, pendientes, verificación de PHP2Shell |
| [resultados.md](resultados.md) | Comparación antes / después |
| [checklist-externo.md](checklist-externo.md) | Lo que depende del hosting y del registrador (incluye mensaje al hosting y DNSSEC) |
| [../../media-src/README.md](../../media-src/README.md) | Originales de video y cómo se generó la versión comprimida |

## Despliegue (en orden)

> Requisitos de build: Node.js ≥ 18.18 (recomendado 20 o 22). Hacer todo en un horario de bajo tráfico.

1. **Respaldo**: cPanel → *Copia de seguridad* → descargar `public_html` completo y la base de datos.
2. **Archivo de configuración** (con la contraseña *actual*, para que el cambio de `db.php` no corte nada):
   crear `/home/<usuario-cpanel>/nasello-config.php` (fuera de `public_html`) a partir de
   `php/config.example.php`; permisos **600**.
3. **API PHP**: subir `php/api/db.php` y `php/api/.htaccess` a `public_html/api/`.
   Verificar: login en `/admin/login/` funciona; `https://www.nasellocables.com/api/db.php` → **403**.
4. **Rotar la contraseña MySQL** en cPanel y actualizarla en `nasello-config.php` (pasos en `01-credenciales.md`).
   Verificar de nuevo el login y que Productos/Catálogos cargan.
5. **Rotar las contraseñas SMTP** de las casillas que estuvieron en el `.env` histórico (`01-credenciales.md`).
   Revisar `public_html/enviar-pedido.php` (existe solo en el servidor) por credenciales en texto plano.
6. **Build del sitio** en una PC local:
   ```bash
   npm ci
   ```
   ```bash
   npm run build
   ```
7. **Subir el contenido de `out/`** a `public_html/`, **sobrescribiendo** (no borrar la carpeta: allí están `api/`,
   `uploads/`, `enviar-pedido.php` y archivos subidos desde el admin). Incluir los archivos ocultos
   **`.htaccess`** y **`.user.ini`** (en el Administrador de archivos: *Configuración → Mostrar archivos ocultos*).
   Ojo: si desde `/admin/media` se reemplazaron imágenes en el servidor después del último build, subir `out/assets/`
   pisaría esos cambios; en ese caso, subir solo lo que cambió en esta rama o descargar antes `public_html/assets/`.
8. **Verificar en producción** (desde el navegador, sin herramientas de carga):
   - Todas las secciones y el admin cargan; consola del navegador sin errores de CSP.
   - El video del home y de Empresa se reproduce; los sliders se ven.
   - SecurityHeaders.com y los `curl` de `02-cabeceras.md`.
   - `https://www.nasellocables.com/robots.txt` y `/sitemap.xml` responden; `/.user.ini` y `/api/db.php` → 403.
   - Si algo da **500**: ver "Si el `.htaccess` da error 500" en `02-cabeceras.md`.
9. **Enviar el mensaje al hosting** (`checklist-externo.md`): PHP, MariaDB, phpMyAdmin, ServerTokens, HTTP/2.
10. **DNSSEC** con el registrador (`checklist-externo.md`).
11. **Subir HSTS por etapas** a lo largo de las semanas siguientes (`02-cabeceras.md`).
12. Repetir PageSpeed Insights / Lighthouse contra producción y comparar con `resultados.md`.

**Vuelta atrás**: restaurar el respaldo del paso 1 (`public_html`); el archivo de configuración fuera de
`public_html` puede quedar, no afecta al `db.php` viejo.
