<?php
// POST /api/price-save.php  (admin only)
// Body: { product_category, code, price_per_meter, supplier? }

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path', '/');
if (!empty($_SERVER['HTTPS'])) ini_set('session.cookie_secure', 1);
session_start();
header('Content-Type: application/json');

if (empty($_SESSION['admin'])) { http_response_code(401); echo json_encode(['error'=>'No autorizado']); exit; }

$d = json_decode(file_get_contents('php://input'), true);
$cat   = trim($d['product_category'] ?? '');
$code  = trim($d['code']  ?? '');
$price = (float)($d['price_per_meter'] ?? -1);
$supp  = trim($d['supplier'] ?? '');

if ($cat==='' || $code==='' || $price<0) { http_response_code(400); echo json_encode(['error'=>'Datos inválidos']); exit; }

require_once __DIR__ . '/db.php';
$db = getDB();
$st = $db->prepare('INSERT INTO product_prices (product_category,code,price_per_meter,supplier) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE price_per_meter=VALUES(price_per_meter), supplier=VALUES(supplier)');
$st->execute([$cat,$code,$price,$supp]);
echo json_encode(['ok'=>true]);
