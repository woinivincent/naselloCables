<?php
require_once __DIR__ . '/db.php';
// POST /api/catalog-create.php  (requires active admin session)
// Body: { "name": "...", "supplier": "..." }

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
$name     = trim($data['name']     ?? '');
$supplier = trim($data['supplier'] ?? '');

if ($name === '' || $supplier === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre y proveedor son requeridos']);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('INSERT INTO catalogs (name, supplier) VALUES (?, ?)');
    $stmt->execute([$name, $supplier]);

    echo json_encode(['ok' => true, 'id' => (int)$db->lastInsertId()]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
