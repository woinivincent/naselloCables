<?php
// ─────────────────────────────────────────────
// Database connection — deploy to public_html/api/
//
// Credentials are NOT stored in this file. They are read, in order, from:
//   1. Environment variables NASELLO_DB_HOST / _NAME / _USER / _PASS
//      (e.g. SetEnv in a non-public Apache config, if the hosting allows it).
//   2. A PHP config file OUTSIDE the web root. Default location:
//        /home/<cpanel-user>/nasello-config.php   (two levels above public_html/api/)
//      Override with the NASELLO_CONFIG_FILE environment variable.
//      See php/config.example.php for the expected format.
// ─────────────────────────────────────────────

function loadDbConfig(): array {
    $keys = ['host' => 'NASELLO_DB_HOST', 'name' => 'NASELLO_DB_NAME', 'user' => 'NASELLO_DB_USER', 'pass' => 'NASELLO_DB_PASS'];

    $config = [];
    foreach ($keys as $key => $env) {
        $value = getenv($env);
        if ($value !== false && $value !== '') {
            $config[$key] = $value;
        }
    }
    if (count($config) === count($keys)) {
        return $config;
    }

    $file = getenv('NASELLO_CONFIG_FILE') ?: dirname(__DIR__, 2) . '/nasello-config.php';
    if (!is_readable($file)) {
        error_log('[nasello] DB config not found: set NASELLO_DB_* env vars or create ' . $file);
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Server configuration error']);
        exit;
    }

    $fileConfig = require $file;
    return array_merge(is_array($fileConfig['db'] ?? null) ? $fileConfig['db'] : [], $config);
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $cfg = loadDbConfig();
        $dsn = 'mysql:host=' . ($cfg['host'] ?? 'localhost') . ';dbname=' . $cfg['name'] . ';charset=utf8mb4';
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}
