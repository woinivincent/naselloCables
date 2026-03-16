-- Run this once in cPanel phpMyAdmin (or MySQL CLI)
-- Creates the users table for admin authentication.

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active        TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Insert the first admin user.
-- Generate the hash in PHP with: echo password_hash('yourpassword', PASSWORD_DEFAULT);
-- Then replace the hash below and run this INSERT.
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT INTO users (username, password_hash) VALUES ('admin', '$2y$10$REPLACE_WITH_YOUR_HASH');
