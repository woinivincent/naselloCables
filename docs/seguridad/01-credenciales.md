# 01 — Credenciales expuestas: rotación y nueva configuración

## Qué cambió en el código

- `php/api/db.php` ya no contiene credenciales. Las lee, en este orden:
  1. Variables de entorno `NASELLO_DB_HOST`, `NASELLO_DB_NAME`, `NASELLO_DB_USER`, `NASELLO_DB_PASS`.
  2. Un archivo PHP **fuera de `public_html`**: por defecto `/home/<usuario-cpanel>/nasello-config.php`
     (dos niveles por encima de `public_html/api/`). Se puede cambiar con la variable `NASELLO_CONFIG_FILE`.
- `php/config.example.php`: plantilla del archivo de configuración.
- `php/api/.htaccess`: bloquea el acceso directo a `db.php`, a archivos `config*.php`, backups, `.sql`, `.env`, etc., y desactiva el listado de directorios.
- `.gitignore`: ignora `nasello-config.php`, `php/config.php` y `.env*`.

En cPanel compartido normalmente **no** se pueden definir variables de entorno para PHP de forma fiable
(`SetEnv` en `.htaccess` queda dentro de `public_html`, que no es lo deseable para secretos). Por eso la vía
recomendada es el archivo fuera de `public_html`.

## Inventario de secretos encontrados en el repo (valores no reproducidos)

| # | Dónde | Qué | Desde / hasta | Acción |
|---|-------|-----|---------------|--------|
| 1 | `php/api/db.php` (commits `71f079a` → `e12afcf`, en `main`) | Host, nombre de base, usuario y **contraseña MySQL** en texto plano. Una única contraseña en todo el historial. | 16/03/2026 → hoy | **Rotar ya** (pasos abajo). |
| 2 | `.env` (commits `0e8c6ea`, `c8ccd42`, `29b7440`; borrado en `d8ee50e`) | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (3 valores distintos de contraseña a lo largo del tiempo), `SMTP_PORT`, `SMTP_FROM`, `ORDER_EMAIL`, `DESTINO_PEDIDO`. | 16/11/2024 → 31/07/2025 | **Rotar las contraseñas de todas las casillas SMTP** que aparecen ahí (aunque ya no se usen en el código, siguen en el historial público). |
| 3 | `src/lib/devStore.ts` | Contraseña en texto plano del usuario `admin` del **mock de desarrollo** (no se usa en producción). | — | Verificar que el admin real de producción **no** use esa misma contraseña; si la usa, cambiarla. |
| 4 | `php/sql/generate_hash.php` | Contraseña por defecto si se ejecuta sin argumento. | — | Verificar que ningún usuario real se creó con ese valor por defecto. |
| 5 | `naselloCables.rar` (raíz) | No se pudo inspeccionar (no hay herramienta para RAR en el entorno). Se eliminó del árbol en esta rama, pero sigue en el historial. | — | Abrirlo localmente y revisar si contiene `.env`, `db.php` u otros secretos. |
| 6 | `package.zip` (raíz) | Revisado: no contiene `.env` ni `db.php` (contiene el proyecto y `.next/`). Eliminado del árbol en esta rama. | — | — |

No se encontraron claves de API de terceros, tokens ni claves privadas (`.pem`) en el árbol actual ni en el historial
(búsqueda por `pass|secret|token|api_key|smtp` sobre los 119 commits de `main`).

### ¿Reescribir el historial?

No se hizo. El repo es público: hay que asumir que las credenciales ya fueron copiadas (forks, clones, caches,
bots que escanean GitHub). **La única mitigación efectiva es rotarlas.** Si además se quiere purgar el historial
(`git filter-repo` + force-push a `main`), es una decisión aparte: invalida los clones existentes y no elimina
copias ya hechas. Alternativa: pasar el repo a **privado** desde GitHub → Settings → General → Danger Zone.

## Pasos para rotar la contraseña MySQL (cPanel)

Hacerlo en una ventana de bajo tráfico; el sitio público es estático y sigue funcionando, solo el panel admin
y las llamadas a `/api/*.php` fallan durante el cambio (1–2 minutos).

1. **Preparar el archivo de configuración** (antes de tocar la contraseña):
   - cPanel → *Administrador de archivos* → ir a `/home/<usuario-cpanel>/` (la carpeta que contiene `public_html`, **no** dentro de ella).
   - Crear `nasello-config.php` con el contenido de `php/config.example.php`, completando `host`, `name` y `user` con los valores actuales (los ves en cPanel → *Bases de datos MySQL*).
   - Permisos del archivo: **600** (clic derecho → *Change Permissions*).
2. **Generar la nueva contraseña**: cPanel → *Bases de datos MySQL* → sección *Usuarios actuales* → usuario de la base → *Cambiar contraseña*. Usar el generador (≥ 24 caracteres). Copiarla.
3. Pegar la nueva contraseña en `nasello-config.php` (`'pass' => '...'`) y guardar.
4. **Subir el nuevo `db.php`** y `api/.htaccess` de esta rama a `public_html/api/` (ver guía de despliegue).
5. Verificar: entrar a `/admin/login/` e iniciar sesión; abrir *Productos* y *Catálogos* (usan la base).
   Comprobar que `https://www.nasellocables.com/api/db.php` responde **403**.
6. Revisar que **no** quede ninguna copia vieja de `db.php` con credenciales en el servidor (`db.php.bak`, `db_old.php`, etc.).
7. Opcional pero recomendado: en cPanel → *Bases de datos MySQL*, confirmar que el usuario solo tiene privilegios sobre su base, y en *MySQL remoto* que no haya hosts remotos habilitados (`%`).
8. Revisar en cPanel → *Métricas → Errores* / logs de acceso si hubo accesos sospechosos a la base o a `/api/` desde el 16/03/2026.

## Pasos para rotar las contraseñas SMTP

1. cPanel → *Cuentas de correo electrónico* (o el proveedor de correo que corresponda a los `SMTP_HOST` históricos).
2. Para cada casilla que se usó como `SMTP_USER` (puede haber hasta 3 distintas en el historial): *Administrar* → *Cambiar contraseña*.
3. Actualizar cualquier cliente de correo o servicio que use esas casillas.
4. Nota: `php/api/forgot-password.php` envía correo con `mail()` de PHP (sin credenciales en el repo). La ruta Node `api/enviar-pedido` no se publica en el export estático.
