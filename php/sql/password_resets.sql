-- Run once in cPanel phpMyAdmin
-- 1. Add email column to users (if not already present)
ALTER TABLE users ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT '' AFTER username;
ALTER TABLE users ADD UNIQUE INDEX idx_users_email (email);

-- 2. Set the admin email
UPDATE users SET email = 'webadmin@nasellocables.com' WHERE username = 'admin';

-- 3. Create password_resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    token      VARCHAR(64)  NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user  (user_id)
);
