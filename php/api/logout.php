<?php
// POST /api/logout.php

ini_set('session.cookie_path', '/');
session_start();

header('Content-Type: application/json');

$_SESSION = [];
session_destroy();

echo json_encode(['ok' => true]);
