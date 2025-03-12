<?php

namespace App\Http\Controllers;

    // Store a new pair candidate
    use Inertia\Inertia;
    use Illuminate\Http\Request;
    use App\Models\PairCandidate;
    use Illuminate\Support\Facades\Auth;
    use Illuminate\Support\Facades\Log;

class PairCandidateController extends Controller
{
    // Fetch all pair candidates
    public function index()
    {
        $pairCandidates = PairCandidate::all();
        return response()->json($pairCandidates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pair_name' => 'required|string',
            'male_name' => 'required|string',
            'male_age' => 'required|integer',
            'male_vital' => 'required|string',
            'male_picture' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            'female_name' => 'required|string',
            'female_age' => 'required|integer',
            'female_vital' => 'required|string',
            'female_picture' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
        ]);
    
        // Handle image upload
        if ($request->hasFile('male_picture')) {
            $validated['male_picture'] = $request->file('male_picture')->store('pair_candidates', 'public');
        }
    
        if ($request->hasFile('female_picture')) {
            $validated['female_picture'] = $request->file('female_picture')->store('pair_candidates', 'public');
        }
    
        PairCandidate::create($validated);
    
        return redirect()->back()->with('success', 'Pair Candidate added successfully!');
    }

    

    // Fetch a single pair candidate
    public function show(PairCandidate $pairCandidate)
    {
        return response()->json($pairCandidate);
    }

    // Update a pair candidate
    public function update(Request $request, PairCandidate $pairCandidate)
    {
        $request->validate([
            'pair_name' => 'sometimes|string',
            'male_name' => 'sometimes|string',
            'male_age' => 'sometimes|integer',
            'male_vital' => 'sometimes|string',
            'male_picture' => 'sometimes|string',
            'female_name' => 'sometimes|string',
            'female_age' => 'sometimes|integer',
            'female_vital' => 'sometimes|string',
            'female_picture' => 'sometimes|string',
        ]);

        $pairCandidate->update($request->all());
        return response()->json($pairCandidate);
    }

    // Delete a pair candidate
    public function destroy(PairCandidate $pairCandidate)
    {
        $pairCandidate->delete();
        return response()->json(null, 204);
    }

    public function getAssignedPairCandidates()
    {
        
    
        $judgeId = auth()->id(); // Get the ID of the currently authenticated judge
    
        // Query pair candidates that are assigned to the current judge
        $pairCandidates = PairCandidate::whereHas('judges', function ($query) use ($judgeId) {
            $query->where('judge_id', $judgeId)
                  ->where(function ($query) {
                      $query->where('assigned_male', true)
                            ->orWhere('assigned_female', true);
                  });
        })->with(['judges' => function ($query) use ($judgeId) {
            $query->where('judge_id', $judgeId)
                  ->select('pair_candidate_id', 'assigned_male', 'assigned_female');
        }])->get();
    
        // Filter the response to include only assigned candidates
        $filteredPairCandidates = $pairCandidates->map(function ($pairCandidate) {
            $judgeAssignment = $pairCandidate->judges->first();
    
            $filteredPair = [
                'id' => $pairCandidate->id,
                'pair_name' => $pairCandidate->pair_name,
            ];
    
            if ($judgeAssignment->assigned_male) {
                $filteredPair['male'] = [
                    'name' => $pairCandidate->male_name,
                    'age' => $pairCandidate->male_age,
                    'vital' => $pairCandidate->male_vital,
                    'picture' => $pairCandidate->male_picture,
                ];
            }
    
            if ($judgeAssignment->assigned_female) {
                $filteredPair['female'] = [
                    'name' => $pairCandidate->female_name,
                    'age' => $pairCandidate->female_age,
                    'vital' => $pairCandidate->female_vital,
                    'picture' => $pairCandidate->female_picture,
                ];
            }
    
            return $filteredPair;
        });
    
       
    
        return response()->json($filteredPairCandidates);
    }
}