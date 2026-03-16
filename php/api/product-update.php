<?php
// POST /api/product-update.php  (requires active admin session)

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

$id = (int)($data['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

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

    // Check product exists
    $check = $db->prepare('SELECT id FROM products WHERE id = ? LIMIT 1');
    $check->execute([$id]);
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Producto no encontrado']);
        exit;
    }

    // Prevent duplicate category on a different product
    $dupCheck = $db->prepare('SELECT id FROM products WHERE category = ? AND id != ? LIMIT 1');
    $dupCheck->execute([trim($data['category']), $id]);
    if ($dupCheck->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Ya existe otro producto con esa categoría']);
        exit;
    }

    $stmt = $db->prepare('
        UPDATE products SET
            product_code    = :product_code,
            name            = :name,
            description     = :description,
            category        = :category,
            slug            = :slug,
            use_text        = :use_text,
            images          = :images,
            codes           = :codes,
            colors          = :colors,
            presentation    = :presentation,
            technical_specs = :technical_specs
        WHERE id = :id
    ');

    $stmt->execute([
        ':id'             => $id,
        ':product_code'   => trim($data['product_code'] ?? ''),
        ':name'           => trim($data['name']),
        ':description'    => trim($data['description']),
        ':category'       => trim($data['category']),
        ':slug'           => trim($data['slug'] ?? '') ?: null,
        ':use_text'       => trim($data['use_text'] ?? '') ?: null,
        ':images'         => $data['images']         ?? '[]',
        ':codes'          => $data['codes']          ?? '[]',
        ':colors'         => $data['colors']         ?? '[]',
        ':presentation'   => $data['presentation']   ?? '[]',
        ':technical_specs'=> $data['technical_specs'] ?? '[]',
    ]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
