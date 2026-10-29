<?php
// ─────────────────────────────────────────────
// Example configuration for the PHP API.
//
// Copy this file to /home/<cpanel-user>/nasello-config.php on the server
// (OUTSIDE public_html), fill in the real values and set permissions to 600.
// NEVER commit the real file — it is ignored in .gitignore.
// ─────────────────────────────────────────────

return [
    'db' => [
        'host' => 'localhost',
        'name' => 'CPANELUSER_dbname',
        'user' => 'CPANELUSER_dbuser',
        'pass' => 'CHANGE_ME',
    ],
];
