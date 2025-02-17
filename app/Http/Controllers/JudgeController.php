<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Judge; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;



class JudgeController extends Controller
{
    
    public function index()
    {
        $judges = judge::all();
        return response()->json($judges);
    }


    public function create()
    {
        return view('auth.register-judge'); // View for the judge registration form
    }

  
public function store(Request $request)
{
    // Validate the incoming request
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'username' => 'required|string|max:255|unique:judges', // Ensure unique username for judges
        'password' => 'required|string|min:6', // Fixed validation issue
        'picture' => 'nullable|image|mimes:jpg,png,jpeg|max:2048', // Validate image file
    ]);

    if ($validator->fails()) {
        return back()->withErrors($validator)->withInput();
    }

    // Handle profile picture upload
    $picturePath = null;
    if ($request->hasFile('picture')) {
        $picturePath = $request->file('picture')->store('judges', 'public'); // Store in storage/app/public/judges
    }

    // Create the judge record
    $judge = Judge::create([
        'name' => $request->name,
        'username' => $request->username,
        'password' => Hash::make($request->password),
        'picture' => $picturePath, // Save the picture path
    ]);

    return redirect()->route('Ajudge')->with('success', 'Judge registered successfully.');
}


    public function destroy($id)
    {
        $judge = Judge::find($id);
        if ($judge) {
            $judge->delete();
            return response()->json(['message' => 'Judge deleted successfully']);
        }
        return response()->json(['message' => 'Judge not found'], 404);
    }
    public function update(Request $request, Judge $judge)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:judges,username,' . $judge->id,
            'password' => 'nullable|string|min:6',
        ]);
    
        $judge->name = $request->name;
        $judge->username = $request->username;
        if ($request->password) {
            $judge->password = Hash::make($request->password);
        }
        $judge->save();
    
        return redirect()->route('Ajudge')->with('success', 'Judge updated successfully');
    }
    

}
