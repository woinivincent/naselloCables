<?php
// POST /api/calculate-order.php  — PUBLIC
// Input:  { items: [{ category, code, quantity, presentation }] }
// Output: { total, is_wholesale }
// Prices not exposed to client.

header('Content-Type: application/json');
define('WHOLESALE_THRESHOLD', 3_000_000);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$data  = json_decode(file_get_contents('php://input'), true);
$items = $data['items'] ?? [];
if (!is_array($items) || !$items) { echo json_encode(['total'=>0,'is_wholesale'=>false]); exit; }

function metersPerPack(string $presentation): int {
    if (preg_match('/(\d+)\s*(?:mts?)\b/i', $presentation, $m)) return (int)$m[1];
    $p = strtolower($presentation);
    if (str_contains($p,'bobinita')) return 300;
    if (str_contains($p,'bobina'))   return 1000;
    if (str_contains($p,'rollo'))    return 100;
    return 100;
}

require_once __DIR__ . '/db.php';
$db = getDB();

// Fetch prices for all categories in cart
$cats = array_unique(array_column($items, 'category'));
$ph   = implode(',', array_fill(0, count($cats), '?'));
$st   = $db->prepare("SELECT product_category, code, price_per_meter FROM product_prices WHERE product_category IN ($ph)");
$st->execute($cats);
$priceRows = $st->fetchAll(PDO::FETCH_ASSOC);

// Index: UPPER(category::code) → price
$map = [];
foreach ($priceRows as $r) {
    $key = strtoupper($r['product_category'].'::'.str_replace(',','.',$r['code']));
    $map[$key] = (float)$r['price_per_meter'];
}

$total = 0.0;
foreach ($items as $item) {
    $cat      = strtoupper($item['category'] ?? '');
    $code     = strtoupper(str_replace(',','.',trim($item['code'] ?? '')));
    $qty      = (int)($item['quantity'] ?? 0);
    $pres     = $item['presentation'] ?? '';
    $meters   = metersPerPack($pres);
    $unitPrice = $map["$cat::$code"] ?? 0.0;
    $total    += $unitPrice * $meters * $qty;
}

echo json_encode(['total'=>round($total,2), 'is_wholesale'=>$total>WHOLESALE_THRESHOLD]);
