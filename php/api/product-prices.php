<?php
// GET /api/product-prices.php  (admin only)
// Returns all price rows. Optional: ?category=xxx

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path', '/');
if (!empty($_SERVER['HTTPS'])) ini_set('session.cookie_secure', 1);
session_start();
header('Content-Type: application/json');

if (empty($_SESSION['admin'])) { http_response_code(401); echo json_encode(['error'=>'No autorizado']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

require_once __DIR__ . '/db.php';

$db = getDB();
$cat = trim($_GET['category'] ?? '');
if ($cat !== '') {
    $st = $db->prepare('SELECT product_category,code,price_per_meter,supplier FROM product_prices WHERE product_category=? ORDER BY code ASC');
    $st->execute([$cat]);
} else {
    $st = $db->query('SELECT product_category,code,price_per_meter,supplier FROM product_prices ORDER BY product_category,code');
}
$rows = $st->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as &$r) $r['price_per_meter'] = (float)$r['price_per_meter'];
echo json_encode($rows);
