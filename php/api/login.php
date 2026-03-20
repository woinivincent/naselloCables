<?php
require_once __DIR__ . '/db.php';
// POST /api/login.php
// Body: { "username": "...", "password": "..." }

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path', '/');
if (!empty($_SERVER['HTTPS'])) ini_set('session.cookie_secure', 1);
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Campos requeridos']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db  = getDB();
    $stmt = $db->prepare('SELECT id, password_hash, role FROM users WHERE username = ? AND active = 1 LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['admin']    = true;
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $username;
    $_SESSION['role']     = $user['role'];

    echo json_encode(['ok' => true, 'username' => $username, 'role' => $user['role']]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
