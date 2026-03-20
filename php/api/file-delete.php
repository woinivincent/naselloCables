<?php
require_once __DIR__ . '/db.php';
// POST /api/file-delete.php  (requires active admin session)
// JSON body: { "id": 1 }

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
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();

    // Fetch filename before deleting
    $stmt = $db->prepare('SELECT filename FROM technical_files WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Archivo no encontrado']);
        exit;
    }

    // Delete DB record
    $del = $db->prepare('DELETE FROM technical_files WHERE id = ?');
    $del->execute([$id]);

    // Delete physical file (non-fatal if missing)
    $filePath = __DIR__ . '/../../uploads/technical_files/' . $row['filename'];
    if (file_exists($filePath)) {
        @unlink($filePath);
    }

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
