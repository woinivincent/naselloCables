<?php
// GET /api/check-auth.php
// Returns { ok: true, username } if session is valid, { ok: false } otherwise.

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path', '/');
if (!empty($_SERVER['HTTPS'])) ini_set('session.cookie_secure', 1);
session_start();

header('Content-Type: application/json');

if (!empty($_SESSION['admin'])) {
    echo json_encode([
        'ok'       => true,
        'username' => $_SESSION['username'] ?? '',
        'role'     => $_SESSION['role']     ?? 'editor',
    ]);
} else {
    http_response_code(401);
    echo json_encode(['ok' => false]);
}
