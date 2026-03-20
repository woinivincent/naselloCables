<?php
require_once __DIR__ . '/db.php';
// POST /api/user-create.php
// Body: { "username": "...", "email": "...", "password": "...", "role": "admin|editor" }
// Requires admin session. Max 5 users total.

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

$data     = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$email    = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';
$role     = $data['role'] ?? '';

if ($username === '' || $email === '' || $password === '' || !in_array($role, ['admin', 'editor'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos incompletos o rol inválido']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'El email no es válido']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db = getDB();

    // Enforce 5-user limit
    $count = $db->query('SELECT COUNT(*) FROM users WHERE active = 1')->fetchColumn();
    if ($count >= 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Máximo 5 usuarios permitidos']);
        exit;
    }

    // Check for duplicate username or email
    $check = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
    $check->execute([$username, $email]);
    if ($check->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'El usuario o email ya existe']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$username, $email, $hash, $role]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
