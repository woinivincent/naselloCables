<?php
require_once __DIR__ . '/db.php';
// POST /api/catalog-upload.php  (requires active admin session)
// multipart/form-data fields: id (catalog id), file (PDF / Excel / CSV)
// Stores the file as catalog_{id}.{ext} — replacing keeps the same link.

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

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id inválido']);
    exit;
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Archivo no recibido o con error']);
    exit;
}

$file = $_FILES['file'];

// Allowed types: PDF, Excel (.xlsx), CSV
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$allowed  = [
    'application/pdf'                                                   => 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
    'application/zip'                                                   => 'xlsx', // .xlsx detected as zip on some servers
    'text/csv'                                                          => 'csv',
    'text/plain'                                                        => 'csv',
];

$extFromName = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!isset($allowed[$mimeType]) || !in_array($extFromName, ['pdf', 'xlsx', 'csv'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Solo se permiten archivos PDF, Excel (.xlsx) o CSV']);
    exit;
}

// Validate size (max 10 MB)
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo supera los 10 MB']);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id, filename FROM catalogs WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $catalog = $stmt->fetch();

    if (!$catalog) {
        http_response_code(404);
        echo json_encode(['error' => 'Catálogo no encontrado']);
        exit;
    }

    $uploadDir = __DIR__ . '/../uploads/catalogs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Stable name per catalog: replacing the file keeps the same link
    $filename = 'catalog_' . $id . '.' . $extFromName;
    $dest     = $uploadDir . $filename;

    // Remove previous file if the extension changed (catalog_1.xlsx → catalog_1.pdf)
    if ($catalog['filename'] !== '' && $catalog['filename'] !== $filename) {
        $old = $uploadDir . basename($catalog['filename']);
        if (is_file($old)) @unlink($old);
    }

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo guardar el archivo']);
        exit;
    }

    $db->prepare('UPDATE catalogs SET filename = ? WHERE id = ?')->execute([$filename, $id]);

    echo json_encode([
        'ok'       => true,
        'file_url' => '/uploads/catalogs/' . rawurlencode($filename),
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
