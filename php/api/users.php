<?php
// GET /api/users.php
// Returns all users (no passwords). Requires admin session.

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path', '/');
if (!empty($_SERVER['HTTPS'])) ini_set('session.cookie_secure', 1);
session_start();

header('Content-Type: application/json');

if (empty($_SESSION['admin'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Se requiere rol administrador']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db   = getDB();
    $stmt = $db->query('SELECT id, username, role, created_at FROM users WHERE active = 1 ORDER BY id ASC');
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
