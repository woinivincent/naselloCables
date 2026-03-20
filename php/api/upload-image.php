<?php
// POST /api/upload-image.php  (requires active admin session)
// multipart/form-data: subfolder (logos|productos|general), file (jpg/jpeg/png/webp/svg)
// Optional: replace_path — if set, overwrite the file at that exact path under assets/

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

$allowedSubfolders = ['logos', 'productos', 'general'];
$allowedMimes      = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
$maxSize           = 5 * 1024 * 1024; // 5 MB

$subfolder    = trim($_POST['subfolder']    ?? '');
$replacePath  = trim($_POST['replace_path'] ?? '');

if (!in_array($subfolder, $allowedSubfolders, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'subfolder inválido. Use: logos, productos, general']);
    exit;
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Archivo no recibido o con error']);
    exit;
}

$file = $_FILES['file'];

// Validate MIME type
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
if (!in_array($mimeType, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Use jpg, png, webp o svg']);
    exit;
}

// Validate size
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo supera los 5 MB']);
    exit;
}

// Determine extension from MIME
$extMap = [
    'image/jpeg'   => 'jpg',
    'image/png'    => 'png',
    'image/webp'   => 'webp',
    'image/svg+xml'=> 'svg',
];
$ext = $extMap[$mimeType];

// Base assets directory (two levels above php/api/)
$assetsBase = realpath(__DIR__ . '/../../assets');
if ($assetsBase === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Directorio de assets no encontrado']);
    exit;
}

// If replace_path is provided, validate it stays within assets/
if ($replacePath !== '') {
    // Normalize and prevent path traversal
    $fullReplace = realpath($assetsBase . '/' . $replacePath);
    if ($fullReplace === false || strpos($fullReplace, $assetsBase) !== 0) {
        http_response_code(400);
        echo json_encode(['error' => 'replace_path inválido']);
        exit;
    }
    $dest     = $fullReplace;
    $filename = basename($fullReplace);
    $url      = '/assets/' . ltrim(str_replace($assetsBase, '', $fullReplace), '/\\');
} else {
    // Build a new safe unique filename
    $base     = preg_replace('/[^a-z0-9_\-]/i', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = $base . '_' . time() . '.' . $ext;
    $dir      = $assetsBase . '/' . $subfolder;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $dest = $dir . '/' . $filename;
    $url  = '/assets/' . $subfolder . '/' . rawurlencode($filename);
}

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar la imagen']);
    exit;
}

echo json_encode(['ok' => true, 'url' => $url]);
