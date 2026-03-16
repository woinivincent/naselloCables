<?php
// Run once via CLI or browser to generate a password hash.
// Usage: php generate_hash.php yourpassword
// Copy the output and paste it into the INSERT in create_users.sql

$password = $argv[1] ?? 'changeme';
echo password_hash($password, PASSWORD_DEFAULT) . PHP_EOL;
