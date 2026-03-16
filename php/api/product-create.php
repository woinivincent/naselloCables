<?php
// POST /api/product-create.php  (requires active admin session)

ini_set('session.cookie_path', '/');
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

// Required fields
$required = ['name', 'description', 'category'];
foreach ($required as $field) {
    if (empty(trim($data[$field] ?? ''))) {
        http_response_code(400);
        echo json_encode(['error' => "Campo requerido: $field"]);
        exit;
    }
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();

    // Prevent duplicate category slug
    $check = $db->prepare('SELECT id FROM products WHERE category = ? LIMIT 1');
    $check->execute([trim($data['category'])]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Ya existe un producto con esa categoría']);
        exit;
    }

    $stmt = $db->prepare('
        INSERT INTO products
            (product_code, name, description, category, slug, use_text, images, codes, colors, presentation, technical_specs)
        VALUES
            (:product_code, :name, :description, :category, :slug, :use_text, :images, :codes, :colors, :presentation, :technical_specs)
    ');

    $stmt->execute([
        ':product_code'   => trim($data['product_code'] ?? ''),
        ':name'           => trim($data['name']),
        ':description'    => trim($data['description']),
        ':category'       => trim($data['category']),
        ':slug'           => trim($data['slug'] ?? '') ?: null,
        ':use_text'       => trim($data['use_text'] ?? '') ?: null,
        ':images'         => $data['images']        ?? '[]',
        ':codes'          => $data['codes']         ?? '[]',
        ':colors'         => $data['colors']        ?? '[]',
        ':presentation'   => $data['presentation']  ?? '[]',
        ':technical_specs'=> $data['technical_specs'] ?? '[]',
    ]);

    $id = $db->lastInsertId();
    echo json_encode(['ok' => true, 'id' => (int)$id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
