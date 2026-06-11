<?php
require_once __DIR__ . '/db.php';
// POST /api/catalog-import.php  (requires active admin session)
// Body: { "id": 1, "items": [{ "product_category": "...", "code": "...", "price_per_meter": 123.45 }] }
// Bulk-upserts the parsed catalog rows into product_prices (supplier taken from the catalog)
// and stamps imported_at / items_count on the catalog.

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

$data  = json_decode(file_get_contents('php://input'), true);
$id    = (int)($data['id'] ?? 0);
$items = $data['items'] ?? [];

if ($id <= 0 || !is_array($items) || !$items) {
    http_response_code(400);
    echo json_encode(['error' => 'id e items son requeridos']);
    exit;
}

if (count($items) > 2000) {
    http_response_code(400);
    echo json_encode(['error' => 'Demasiadas filas (máx. 2000)']);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id, supplier FROM catalogs WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $catalog = $stmt->fetch();

    if (!$catalog) {
        http_response_code(404);
        echo json_encode(['error' => 'Catálogo no encontrado']);
        exit;
    }

    $supplier = $catalog['supplier'];

    $db->beginTransaction();

    $upsert = $db->prepare(
        'INSERT INTO product_prices (product_category, code, price_per_meter, supplier)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE price_per_meter = VALUES(price_per_meter), supplier = VALUES(supplier)'
    );

    $applied = 0;
    foreach ($items as $item) {
        $cat   = trim($item['product_category'] ?? '');
        $code  = trim($item['code'] ?? '');
        $price = (float)($item['price_per_meter'] ?? -1);

        if ($cat === '' || $code === '' || $price < 0) continue; // skip invalid rows

        $upsert->execute([$cat, $code, $price, $supplier]);
        $applied++;
    }

    if ($applied === 0) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(['error' => 'Ninguna fila válida para importar']);
        exit;
    }

    $db->prepare('UPDATE catalogs SET items_count = ?, imported_at = NOW() WHERE id = ?')
       ->execute([$applied, $id]);

    $db->commit();

    echo json_encode(['ok' => true, 'applied' => $applied]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
