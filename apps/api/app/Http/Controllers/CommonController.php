<?php

namespace App\Http\Controllers;

use App\Models\Bank;

class CommonController extends Controller
{
    public function banks()
    {
        return response()->json(Bank::all());
    }
}