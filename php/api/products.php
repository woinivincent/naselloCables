<?php
// GET /api/products.php — returns all products from cable_catalog.json
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$json_path = __DIR__ . '/cable_catalog.json';

if (!file_exists($json_path)) {
    http_response_code(500);
    echo json_encode(['error' => 'catalog not found']);
    exit;
}

$raw     = file_get_contents($json_path);
$catalog = json_decode($raw, true)['cable_catalog'] ?? [];

$products = [];
$i = 1;
foreach ($catalog as $category => $data) {
    $products[] = [
        'id'             => $i++,
        'category'       => $category,
        'name'           => $data['name']                         ?? $category,
        'codes'          => json_encode($data['codes']        ?? []),
        'colors'         => json_encode($data['colors']       ?? []),
        'presentation'   => json_encode($data['presentation'] ?? []),
        'use_text'       => $data['use']                          ?? '',
        'images'         => json_encode($data['images']       ?? []),
        'technical_file' => $data['technical_file']               ?? null,
    ];
}

echo json_encode($products);
