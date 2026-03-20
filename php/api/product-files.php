<?php
require_once __DIR__ . '/db.php';
// GET /api/product-files.php?category=subterraneos
// Public — no auth required.

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$category = trim($_GET['category'] ?? '');
if ($category === '') {
    http_response_code(400);
    echo json_encode(['error' => 'category requerido']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT id, label, filename FROM technical_files WHERE product_category = ? ORDER BY created_at ASC'
    );
    $stmt->execute([$category]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = array_map(function ($row) {
        return [
            'id'    => (int)$row['id'],
            'label' => $row['label'],
            'url'   => '/uploads/technical_files/' . rawurlencode($row['filename']),
        ];
    }, $rows);

    echo json_encode($result);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
