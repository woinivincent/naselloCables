<?php
require_once __DIR__ . '/db.php';
// POST /api/reset-password.php
// Body: { "token": "...", "password": "..." }

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$token    = trim($data['token']    ?? '');
$password = $data['password'] ?? '';

if ($token === '' || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Token y contraseña requeridos (mínimo 6 caracteres)']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();

    // Fetch valid token + user in one query
    $stmt = $db->prepare(
        'SELECT pr.id AS reset_id, pr.user_id FROM password_resets pr
         JOIN users u ON u.id = pr.user_id
         WHERE pr.token = ? AND pr.used = 0 AND pr.expires_at > NOW() AND u.active = 1
         LIMIT 1'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(400);
        echo json_encode(['error' => 'El enlace es inválido o ya expiró']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Update password and mark token as used atomically
    $db->beginTransaction();
    $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
       ->execute([$hash, $row['user_id']]);
    $db->prepare('UPDATE password_resets SET used = 1 WHERE id = ?')
       ->execute([$row['reset_id']]);
    $db->commit();

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
