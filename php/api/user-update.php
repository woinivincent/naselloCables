<?php
// POST /api/user-update.php
// Body: { "id": N, "username"?: "...", "password"?: "...", "role"?: "admin|editor" }
// Requires admin session.

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

if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Se requiere rol administrador']);
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
    echo json_encode(['error' => 'ID requerido']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();

    // Fetch current user
    $current = $db->prepare('SELECT * FROM users WHERE id = ? AND active = 1 LIMIT 1');
    $current->execute([$id]);
    $user = $current->fetch();
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }

    $newUsername = isset($data['username']) ? trim($data['username'])               : null;
    $newEmail    = isset($data['email'])    ? strtolower(trim($data['email']))       : null;
    $newPassword = isset($data['password']) ? $data['password']                      : null;
    $newRole     = isset($data['role'])     ? $data['role']                          : null;

    // Validate role
    if ($newRole !== null && !in_array($newRole, ['admin', 'editor'], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Rol inválido']);
        exit;
    }

    // Validate email
    if ($newEmail !== null && $newEmail !== '' && !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'El email no es válido']);
        exit;
    }

    // Prevent removing the last admin
    if ($newRole === 'editor' && $user['role'] === 'admin') {
        $adminCount = $db->query('SELECT COUNT(*) FROM users WHERE role = "admin" AND active = 1')->fetchColumn();
        if ($adminCount <= 1) {
            http_response_code(400);
            echo json_encode(['error' => 'Debe haber al menos un administrador']);
            exit;
        }
    }

    // Check username uniqueness
    if ($newUsername !== null && $newUsername !== $user['username']) {
        $dup = $db->prepare('SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1');
        $dup->execute([$newUsername, $id]);
        if ($dup->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre de usuario ya existe']);
            exit;
        }
    }

    // Check email uniqueness
    if ($newEmail !== null && $newEmail !== '' && $newEmail !== $user['email']) {
        $dup = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1');
        $dup->execute([$newEmail, $id]);
        if ($dup->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'El email ya está en uso']);
            exit;
        }
    }

    // Build update
    $fields = [];
    $params = [];

    if ($newUsername !== null && $newUsername !== '') {
        $fields[] = 'username = ?';
        $params[]  = $newUsername;
    }
    if ($newEmail !== null && $newEmail !== '') {
        $fields[] = 'email = ?';
        $params[]  = $newEmail;
    }
    if ($newPassword !== null && $newPassword !== '') {
        $fields[] = 'password_hash = ?';
        $params[]  = password_hash($newPassword, PASSWORD_DEFAULT);
    }
    if ($newRole !== null) {
        $fields[] = 'role = ?';
        $params[]  = $newRole;
    }

    if (empty($fields)) {
        echo json_encode(['ok' => true]); // nothing to update
        exit;
    }

    $params[] = $id;
    $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
