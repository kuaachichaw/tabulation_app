<?php

namespace App\Http\Controllers;

use App\Models\Judge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
{
    $request->validate([
        'username' => 'required',
        'password' => 'required',
    ]);

    // Attempt to log in using 'username' instead of 'email'
    if (Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
        return redirect()->route('user'); // Redirect after login
    }

    return back()->withErrors(['username' => 'Invalid credentials.']);
}


    public function logout(Request $request)
    {
        $request->session()->forget('judge');
        return redirect()->route('login')->with('status', 'Logged out successfully!');
    }
}
