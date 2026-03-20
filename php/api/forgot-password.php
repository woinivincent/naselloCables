<?php
// POST /api/forgot-password.php
// Body: { "email": "..." }
// Always returns { ok: true } to avoid user enumeration.
// Sends a reset link to the user's email if found.

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

define('FROM_EMAIL',   'webadmin@nasellocables.com');
define('FROM_NAME',    'Nasello Cables');
define('SITE_URL',     'https://nasellocables.com'); // update to your cPanel domain
define('TOKEN_EXPIRY', 3600); // 1 hour in seconds

$data  = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim($data['email'] ?? ''));

if ($email === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email requerido']);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id, username FROM users WHERE email = ? AND active = 1 LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Always respond OK — don't reveal whether the email exists
    if (!$user) {
        echo json_encode(['ok' => true]);
        exit;
    }

    // Invalidate any existing unused tokens for this user
    $db->prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0')
       ->execute([$user['id']]);

    // Generate a secure random token
    $token     = bin2hex(random_bytes(32)); // 64-char hex
    $expiresAt = date('Y-m-d H:i:s', time() + TOKEN_EXPIRY);

    $db->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)')
       ->execute([$user['id'], $token, $expiresAt]);

    // Build reset link
    $resetLink = SITE_URL . '/admin/reset-password?token=' . $token;

    // Email content
    $subject = 'Recuperación de contraseña — Nasello Cables';
    $body    = "Hola {$user['username']},\r\n\r\n"
             . "Recibiste este mail porque solicitaste restablecer tu contraseña del panel de administración.\r\n\r\n"
             . "Hacé clic en el siguiente enlace para crear una nueva contraseña:\r\n"
             . $resetLink . "\r\n\r\n"
             . "El enlace vence en 1 hora.\r\n\r\n"
             . "Si no realizaste esta solicitud, ignorá este mensaje. Tu contraseña no será modificada.\r\n\r\n"
             . "— Nasello Cables";

    $headers  = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mail($email, $subject, $body, $headers);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor']);
}
