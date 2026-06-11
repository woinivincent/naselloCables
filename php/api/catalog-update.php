<?php
require_once __DIR__ . '/db.php';
// POST /api/catalog-update.php  (requires active admin session)
// Body: { "id": 1, "name": "...", "supplier": "..." }

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$id       = (int)($data['id'] ?? 0);
$name     = trim($data['name']     ?? '');
$supplier = trim($data['supplier'] ?? '');

if ($id <= 0 || $name === '' || $supplier === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('UPDATE catalogs SET name = ?, supplier = ? WHERE id = ?');
    $stmt->execute([$name, $supplier, $id]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
