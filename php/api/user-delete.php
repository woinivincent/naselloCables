<?php
require_once __DIR__ . '/db.php';
// POST /api/user-delete.php
// Body: { "id": N }
// Soft-deletes (active = 0). Requires admin session.
// Protects: self-delete, last admin.

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id   = (int)($data['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID requerido']);
    exit;
}

// Prevent self-delete
if ($id === (int)$_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode(['error' => 'No podés eliminarte a vos mismo']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();

    $target = $db->prepare('SELECT role FROM users WHERE id = ? AND active = 1 LIMIT 1');
    $target->execute([$id]);
    $user = $target->fetch();
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }

    // Protect last admin
    if ($user['role'] === 'admin') {
        $adminCount = $db->query('SELECT COUNT(*) FROM users WHERE role = "admin" AND active = 1')->fetchColumn();
        if ($adminCount <= 1) {
            http_response_code(400);
            echo json_encode(['error' => 'Debe haber al menos un administrador']);
            exit;
        }
    }

    // Soft delete
    $db->prepare('UPDATE users SET active = 0 WHERE id = ?')->execute([$id]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
