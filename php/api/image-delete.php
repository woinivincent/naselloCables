<?php
// POST /api/image-delete.php  (requires active admin session)
// Body: { "path": "logos/logo.png" }  — relative to /assets/
// Deletes the file from the filesystem. Prevents path traversal.

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
$relPath  = trim($data['path'] ?? '');

if ($relPath === '') {
    http_response_code(400);
    echo json_encode(['error' => 'path requerido']);
    exit;
}

$assetsBase = realpath(__DIR__ . '/../../assets');
if ($assetsBase === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Directorio de assets no encontrado']);
    exit;
}

// Resolve and validate the path stays within assets/
$fullPath = realpath($assetsBase . '/' . $relPath);
if ($fullPath === false || strpos($fullPath, $assetsBase) !== 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Ruta inválida']);
    exit;
}

// Only allow image extensions
$ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'svg'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Solo se pueden eliminar imágenes']);
    exit;
}

if (!file_exists($fullPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Archivo no encontrado']);
    exit;
}

if (!unlink($fullPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo eliminar el archivo']);
    exit;
}

echo json_encode(['ok' => true]);
