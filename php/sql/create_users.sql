-- Run this once in cPanel phpMyAdmin (or MySQL CLI)
-- Creates the users table for admin authentication.

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)                       NOT NULL UNIQUE,
    password_hash VARCHAR(255)                      NOT NULL,
    role          ENUM('admin', 'editor')           NOT NULL DEFAULT 'editor',
    active        TINYINT(1)                        NOT NULL DEFAULT 1,
    created_at    TIMESTAMP                         DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Insert the first admin user.
-- Generate the hash with: php -r "echo password_hash('yourpassword', PASSWORD_DEFAULT);"
-- Then replace the hash below and run this INSERT.
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT INTO users (username, password_hash, role) VALUES ('admin', '$2y$10$REPLACE_WITH_YOUR_HASH', 'admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- If the table already exists (without role column), run this migration instead:
-- ─────────────────────────────────────────────────────────────────────────────

-- ALTER TABLE users ADD COLUMN role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor' AFTER password_hash;
-- UPDATE users SET role = 'admin' WHERE username = 'admin';
