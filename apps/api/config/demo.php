<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Demo authentication
    |--------------------------------------------------------------------------
    |
    | This switch is intentionally opt-in. The controller also rejects the
    | endpoint when APP_ENV is production, so an accidentally copied local
    | environment value cannot enable demo authentication there.
    |
    */

    'login_enabled' => (bool) env('DEMO_LOGIN_ENABLED', false),

];
