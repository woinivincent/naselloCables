<?php
require_once __DIR__ . '/db.php';
// POST /api/catalog-delete.php  (requires active admin session)
// Body: { "id": 1 }
// Deletes the catalog row and its stored file. Prices already imported
// into product_prices are NOT removed.

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

$data = json_decode(file_get_contents('php://input'), true);
$id   = (int)($data['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id inválido']);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT filename FROM catalogs WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Catálogo no encontrado']);
        exit;
    }

    $db->prepare('DELETE FROM catalogs WHERE id = ?')->execute([$id]);

    if ($row['filename'] !== '') {
        $path = __DIR__ . '/../uploads/catalogs/' . basename($row['filename']);
        if (is_file($path)) @unlink($path);
    }

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
