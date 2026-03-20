<?php
// POST /api/upload-file.php  (requires active admin session)
// multipart/form-data fields: category (string), label (string), file (PDF)

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

$category = trim($_POST['category'] ?? '');
$label    = trim($_POST['label']    ?? '');

if ($category === '' || $label === '') {
    http_response_code(400);
    echo json_encode(['error' => 'category y label son requeridos']);
    exit;
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Archivo no recibido o con error']);
    exit;
}

$file = $_FILES['file'];

// Validate MIME type (PDF only)
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
if ($mimeType !== 'application/pdf') {
    http_response_code(400);
    echo json_encode(['error' => 'Solo se permiten archivos PDF']);
    exit;
}

// Validate PDF magic bytes (%PDF)
$handle = fopen($file['tmp_name'], 'rb');
$magic  = fread($handle, 4);
fclose($handle);
if ($magic !== '%PDF') {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo no es un PDF válido']);
    exit;
}

// Validate size (max 10 MB)
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo supera los 10 MB']);
    exit;
}

// Build a safe unique filename
$ext      = 'pdf';
$base     = preg_replace('/[^a-z0-9_\-]/i', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$filename = $category . '_' . $base . '_' . time() . '.' . $ext;

$uploadDir = __DIR__ . '/../../uploads/technical_files/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$dest = $uploadDir . $filename;
if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el archivo']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'INSERT INTO technical_files (product_category, label, filename) VALUES (?, ?, ?)'
    );
    $stmt->execute([$category, $label, $filename]);
    $id = (int)$db->lastInsertId();

    echo json_encode([
        'ok'  => true,
        'id'  => $id,
        'url' => '/uploads/technical_files/' . rawurlencode($filename),
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    // Remove uploaded file if DB insert fails
    @unlink($dest);
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
