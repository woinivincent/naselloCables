<?php
// GET /api/verify-reset-token.php?token=xxx
// Returns { ok: true } if the token is valid and not expired/used.

header('Content-Type: application/json');

$token = trim($_GET['token'] ?? '');

if ($token === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Token requerido']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT pr.id FROM password_resets pr
         JOIN users u ON u.id = pr.user_id
         WHERE pr.token = ? AND pr.used = 0 AND pr.expires_at > NOW() AND u.active = 1
         LIMIT 1'
    );
    $stmt->execute([$token]);

    if ($stmt->fetch()) {
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'El enlace es inválido o ya expiró']);
    }

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
