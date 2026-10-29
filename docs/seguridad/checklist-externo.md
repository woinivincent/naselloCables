# Checklist de pendientes externos (hosting / registrador)

Nada de esto se puede resolver desde el repo. Marcar cada ítem cuando quede hecho y verificado.

## A. Hosting (cPanel / Apache)

- [ ] **Actualizar PHP 8.1 → 8.4 (≥ 8.4.27) o 8.3 (≥ 8.3.36).** Urgente: PHP 8.1 está fuera de soporte y **no**
      recibe parche oficial para PHP2Shell (CVE-2026-109618 / CVE-2026-109619, RCE pre-autenticación, CVSS 9.2).
      Mientras tanto quedó aplicada la mitigación parcial `session.upload_progress.enabled = 0` (`.user.ini`).
- [ ] **Actualizar MariaDB 10.3.32** (fin de soporte: mayo 2023) a una LTS vigente (10.11 u 11.4).
- [ ] **Actualizar phpMyAdmin 4.9.7** (rama 4.9 sin soporte) a 5.2.x, o deshabilitarlo si no se usa.
- [ ] **`ServerTokens Prod`** en la configuración global de Apache (en `.htaccess` da error 500, verificado).
- [ ] **HTTP/2 (H6)**: habilitar `mod_http2` y `Protocols h2 http/1.1` en el VirtualHost SSL (o activarlo en
      LiteSpeed/Nginx si el hosting usa proxy). La directiva `Protocols` no se admite en `.htaccess`
      (verificado en Apache 2.4.58: `Protocols not allowed here`, error 500). En cPanel/WHM suele estar en
      *WHM → Apache Configuration → Global Configuration* o en EasyApache 4 (`mod_http2`, requiere MPM event).
- [ ] Confirmar que la redirección **HTTP → HTTPS** y **dominio sin www ↔ con www** está configurada en el hosting
      (el repo no la define). Ver nota "Dominio canónico" abajo.
- [ ] Verificar que el hosting permita en `.htaccess`: `Header` (mod_headers), `Options`, `ServerSignature`,
      `AddType`, `<Files>`/`Require`. Si alguna da 500, comentarla (ver `02-cabeceras.md`).

### Mensaje listo para enviar al proveedor de hosting

> **Asunto:** Solicitud urgente de actualización de PHP, MariaDB y phpMyAdmin — cuenta de nasellocables.com
>
> Hola, ¿cómo están?
>
> Les escribimos por la cuenta de hosting de **nasellocables.com**. En una revisión técnica de seguridad detectamos
> que el servidor usa versiones que ya no tienen soporte:
>
> - **PHP 8.1**: está fuera de soporte y no recibió el parche oficial para las vulnerabilidades críticas
>   **CVE-2026-109618 y CVE-2026-109619** ("PHP2Shell"), publicadas por el proyecto PHP el 21/10/2026 y que
>   permiten ejecución remota de código sin autenticación. Las versiones corregidas son 8.5.12, 8.4.27, 8.3.36 y 8.2.35.
> - **MariaDB 10.3.32**: fuera de soporte desde mayo de 2023.
> - **phpMyAdmin 4.9.7**: rama sin soporte.
>
> Les pedimos:
>
> 1. Cambiar la versión de PHP de nuestra cuenta a **PHP 8.4 (8.4.27 o superior)**, o en su defecto **8.3.36 o
>    superior**. Si el servidor no ofrece esas versiones, ¿nos pueden indicar cuándo estarán disponibles o
>    migrarnos a un servidor que las tenga?
> 2. Actualizar **MariaDB** a una versión LTS con soporte vigente (10.11 u 11.4) o migrar la cuenta a un servidor
>    que la tenga, conservando la base de datos y los usuarios.
> 3. Actualizar **phpMyAdmin** a la versión 5.2.x.
> 4. Configurar en Apache **`ServerTokens Prod`** (y `ServerSignature Off`) para no exponer la versión del servidor.
> 5. Habilitar **HTTP/2** para nuestro dominio (mod_http2 / `Protocols h2 http/1.1` en el VirtualHost SSL).
> 6. Confirmarnos si ofrecen **DNSSEC** para la zona DNS que administran y cómo activarlo.
>
> Antes de los cambios de PHP y MariaDB, por favor avísennos el día y horario para hacer un respaldo y estar
> disponibles para verificar el sitio. Si alguna de estas tareas no está incluida en nuestro plan, les pedimos que
> nos indiquen las opciones.
>
> Muchas gracias.
> Saludos,
> [Nombre] — en representación de Nasello Cables

### Qué verificar después de la actualización de PHP / MariaDB

1. Respaldo previo: cPanel → *Copia de seguridad* → base de datos completa + `public_html`.
2. `https://www.nasellocables.com/` y todas las secciones cargan (Home, Empresa, Productos y detalle, Calidad, Contacto, Pedidos).
3. `/admin/login/`: iniciar sesión; abrir Productos, Catálogos, Precios, Medios y Usuarios; editar y guardar un producto de prueba.
4. Subir y eliminar una imagen de prueba en `/admin/media/` y un archivo técnico (verifica `upload-image.php` / `upload-file.php`).
5. Importar un catálogo de prueba en `/admin/catalogs/`.
6. "Olvidé mi contraseña": que llegue el mail (usa `mail()` de PHP).
7. Pedidos: hacer un pedido de prueba (minorista → WhatsApp; mayorista → mail vía `/enviar-pedido.php`).
8. cPanel → *Métricas → Errores*: sin errores nuevos de PHP (deprecations de 8.2+ como propiedades dinámicas).
9. Crear un `info.php` temporal con `<?php phpinfo();` para confirmar la versión de PHP y que
   `session.upload_progress.enabled` = Off; **borrarlo inmediatamente** después.
10. phpMyAdmin: que abra con la nueva versión y que la base `*_nasello_db` esté completa.

## B. DNSSEC (H2)

Desde el repo no se puede saber quién es el registrador ni quién aloja el DNS. Primero averiguarlo
(desde una PC propia): `whois nasellocables.com` (campo *Registrar*) y `dig NS nasellocables.com +short`.

Pasos según dónde esté el DNS:

1. **DNS en el hosting (cPanel)**: cPanel → *Dominios* → *DNSSEC* (o *Zone Editor* → *DNSSEC*) → *Crear clave*
   (algoritmo recomendado: 13, ECDSA P-256 SHA-256) → copiar el registro **DS** (Key Tag, Algoritmo, Digest Type 2, Digest).
   Si la opción no aparece, pedirlo al hosting (punto 6 del mensaje).
2. **DNS en un proveedor externo (Cloudflare, etc.)**: activar DNSSEC en su panel y copiar el registro DS.
3. **En el registrador**: panel del dominio → *DNSSEC* / *Registros DS* → cargar el DS (Key Tag, Algoritmo,
   Tipo de digest, Digest). Si el registrador no ofrece DNSSEC, considerar transferir el dominio.
4. **Esperar** la propagación (hasta 24–48 h) y validar en https://dnsviz.net/d/nasellocables.com/dnssec/ y
   https://dnssec-analyzer.verisignlabs.com/nasellocables.com (todo en verde).
5. ⚠️ **No cambiar de proveedor DNS ni borrar las claves sin antes quitar el DS del registrador**: un DS que no
   coincide deja el dominio (web y correo) sin resolver.

## C. Otros pendientes detectados en la revisión

- [ ] **Rotar credenciales** (MySQL y SMTP históricos): ver `01-credenciales.md`.
- [ ] Revisar archivos que existen **solo en el servidor** y no están en el repo, en particular
      `public_html/enviar-pedido.php` (lo usa `/pedidos`): verificar que no tenga credenciales SMTP en texto plano;
      si las tiene, moverlas al archivo de configuración fuera de `public_html` y rotarlas.
- [ ] Revisar `naselloCables.rar` (historial del repo) en una PC local por si contiene secretos.
- [ ] Decidir si se pasa el repo de GitHub a **privado**.
- [ ] **Dominio canónico**: el sitemap usa `https://www.nasellocables.com`, pero `php/api/forgot-password.php`
      usa `https://nasellocables.com`. Confirmar cuál es el canónico y que el otro redirija con 301; si el
      canónico es sin `www`, cambiar `src/lib/site.ts`.
- [ ] Subir HSTS por etapas (ver `02-cabeceras.md`).
- [ ] Dar de alta el sitemap en Google Search Console (`https://www.nasellocables.com/sitemap.xml`).
- [ ] Caché del navegador: agregar `Cache-Control` largo para `/_next/static/` (archivos con hash) — mejora visitas repetidas; no se incluyó para no ampliar el alcance.
