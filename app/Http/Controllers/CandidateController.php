<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Candidate;
use App\Models\CandidateJudge;
use Illuminate\Support\Facades\Log;

class CandidateController extends Controller
{

    public function index()
    {
        $candidates = Candidate::all();
        return response()->json($candidates);
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:18',
            'vital' => 'required|string',
            'picture' => 'nullable|image|mimes:jpg,png,jpeg|max:2048', // Add picture validation
        ]);

        // Handle image upload
        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('candidates', 'public');
        }

        Candidate::create($validated);

        return redirect()->route('Acandidate')->with('success', 'Candidate created successfully!');
    }



    public function destroy($id)
    {
        $candidate = Candidate::find($id);

        if (!$candidate) {
            return response()->json(['error' => 'Candidate not found'], 404);
        }

        // Delete the candidate's image from storage
        if ($candidate->picture) {
            $imagePath = storage_path('app/public/candidates/' . basename($candidate->picture));
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        $candidate->delete(); // Delete the candidate from the database

        return response()->json(['message' => 'Candidate deleted successfully']);
    }




 // Edit method to fetch and display the candidate's data for updating
 public function edit(Candidate $candidate)
 {
     return response()->json($candidate); // Return candidate data in JSON format
 }

 public function update(Request $request, Candidate $candidate)
 {
     // Validate incoming request data
     $validated = $request->validate([
         'name' => 'required|string|max:255',
         'age' => 'required|integer|min:18',
         'vital' => 'required|string',
         'picture' => 'nullable|image|mimes:jpg,png,jpeg|max:2048', // Add picture validation
     ]);
 
     // Update candidate details
     $candidate->update([
         'name' => $validated['name'],
         'age' => $validated['age'],
         'vital' => $validated['vital'],
     ]);
 
     // Handle image upload if provided
     if ($request->hasFile('picture')) {
         // If there's an existing picture, delete it first (optional step)
         if ($candidate->picture) {
             \Storage::delete('public/' . $candidate->picture);
         }
 
         // Store the new picture and update the candidate's record
         $candidate->picture = $request->file('picture')->store('candidates', 'public');
         $candidate->save();
     }
 
     return redirect()->route('Acandidate')->with('success', 'Candidate updated successfully!');
 }
 
 
 

 public function getAssignedCandidates()
 {
 
     $judgeId = auth()->id();
     
     $candidates = Candidate::whereHas('judges', function ($query) use ($judgeId) {
         $query->where('judge_id', $judgeId);
     })->get();
 
 
     return response()->json($candidates);
 }





}