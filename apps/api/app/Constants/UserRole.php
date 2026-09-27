<?php

namespace App\Constants;

enum UserRole: int {
    case ADMIN = 1;
    case USER = 2;
}