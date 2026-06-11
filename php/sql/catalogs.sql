-- Run once in cPanel phpMyAdmin (or MySQL CLI)
-- Creates the catalogs table: supplier price lists managed from the admin panel.
-- Each catalog is a price list (e.g. "Conduelec Marzo 2026") with an optional
-- source file (PDF/Excel/CSV). Importing a catalog upserts rows into product_prices.

CREATE TABLE IF NOT EXISTS catalogs (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150)  NOT NULL,
    supplier     VARCHAR(100)  NOT NULL,           -- Nasello / Wireflex / Conduelec / otro
    filename     VARCHAR(255)  NOT NULL DEFAULT '', -- stored source file (catalog_{id}.{ext})
    items_count  INT           NOT NULL DEFAULT 0,  -- rows applied in the last import
    imported_at  TIMESTAMP     NULL DEFAULT NULL,   -- last successful import into product_prices
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Files are stored at: /uploads/catalogs/{filename}  (relative to webroot)
-- The filename is always catalog_{id}.{ext} so replacing the file keeps the same link.
-- Make sure that directory exists and is writable:
--   mkdir uploads/catalogs
--   chmod 755 uploads/catalogs
