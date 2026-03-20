-- Run once in cPanel phpMyAdmin (or MySQL CLI)
-- Creates the technical_files table for product PDF attachments.

CREATE TABLE IF NOT EXISTS technical_files (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    product_category VARCHAR(100)  NOT NULL,
    label            VARCHAR(255)  NOT NULL,
    filename         VARCHAR(255)  NOT NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (product_category)
);

-- Files are stored at: /uploads/technical_files/{filename}  (relative to webroot)
-- Make sure that directory exists and is writable:
--   mkdir uploads/technical_files
--   chmod 755 uploads/technical_files
