<?php
require_once __DIR__ . '/db.php';
// GET /api/catalogs.php  (requires active admin session)
// Returns all catalogs (supplier price lists).

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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $db   = getDB();
    $rows = $db->query(
        'SELECT id, name, supplier, filename, items_count, imported_at, created_at
         FROM catalogs ORDER BY created_at DESC'
    )->fetchAll(PDO::FETCH_ASSOC);

    $result = array_map(function ($r) {
        return [
            'id'          => (int)$r['id'],
            'name'        => $r['name'],
            'supplier'    => $r['supplier'],
            'file_url'    => $r['filename'] !== '' ? '/uploads/catalogs/' . rawurlencode($r['filename']) : null,
            'items_count' => (int)$r['items_count'],
            'imported_at' => $r['imported_at'],
            'created_at'  => $r['created_at'],
        ];
    }, $rows);

    echo json_encode($result);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
