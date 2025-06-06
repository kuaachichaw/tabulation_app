<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\JudgeController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\SegmentController;
use App\Http\Controllers\JudgeCandidateController;
use App\Http\Controllers\JudgeSegmentController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\OverallLeaderboardController;
use App\Http\Controllers\PairCandidateController;
use App\Http\Controllers\JudgePairCandidateController;
use App\Http\Controllers\PairSegmentController;
use App\Http\Controllers\PairJudgeSegmentController;
use App\Http\Controllers\PairScoreController;
use App\Http\Controllers\PairLeaderboardController;

Route::prefix('api/leaderboard/pairs')->group(function () {
    Route::get('segment/{segmentId}/{gender}', [PairLeaderboardController::class, 'getSegmentLeaderboard']);
    Route::get('overall/{gender}', [PairLeaderboardController::class, 'getOverallLeaderboard']);
});

Route::post('/api/pair-scores', [PairScoreController::class, 'store'])->middleware('auth');
Route::get('/api/pair-scores/{pairId}', [PairScoreController::class, 'show'])->middleware('auth');


Route::get('/api/pair-judge-segments', [PairJudgeSegmentController::class, 'getAssignedPairJudgeSegments'])->middleware('auth'); // Get assigned pair segments for the logged-in judge
Route::get('/api/pair-judge-segments/{pairSegmentId}', [PairJudgeSegmentController::class, 'index']); 
Route::post('/api/pair-judge-segments', [PairJudgeSegmentController::class, 'store']); 
 

Route::prefix('api')->group(function () {
    Route::get('/pair-segments', [PairSegmentController::class, 'index']);
    Route::post('/pair-segments', [PairSegmentController::class, 'store']);
    Route::delete('/pair-segments/{id}', [PairSegmentController::class, 'destroy']);
});

// Pair Assignments
Route::post('/api/pair-assignments', [JudgePairCandidateController::class, 'store']);
Route::get('/api/pair-assignments/{judgeId}', [JudgePairCandidateController::class, 'show']);

Route::prefix('api')->group(function () {
    // Define the custom route first
    Route::get('/pair-candidates/assigned', [PairCandidateController::class, 'getAssignedPairCandidates'])->middleware('auth');

    // Then define the apiResource route
    Route::apiResource('/pair-candidates', PairCandidateController::class);
});

Route::post('/overall-leaderboard/save', [OverallLeaderboardController::class, 'store']);
Route::get('/overall-leaderboard', [OverallLeaderboardController::class, 'index']);


Route::get('/leaderboard/overall', [LeaderboardController::class, 'getOverallLeaderboard']);
Route::get('/leaderboard/{segment}', [LeaderboardController::class, 'index']);



Route::post('/api/scores', [ScoreController::class, 'store'])->middleware('auth');
Route::get('/api/scores/{candidate}', [ScoreController::class, 'getScores'])->middleware('auth');



Route::get('/api/judge-segments', [JudgeSegmentController::class, 'getAssignedSegments'])->middleware('auth');
Route::get('/api/judge-segment/{segment}', [JudgeSegmentController::class, 'show']);
Route::post('/api/judge-segment', [JudgeSegmentController::class, 'store']);


Route::post('/api/assignments', [JudgeCandidateController::class, 'store']);
Route::get('/api/assignments/{judgeId}', [JudgeCandidateController::class, 'show']);


Route::post('/segments/store', [SegmentController::class, 'store']);
Route::get('/api/segments', [SegmentController::class, 'index']); 
Route::delete('/segments/{id}', [SegmentController::class, 'destroy']);


Route::get('/api/candidates/assigned', [CandidateController::class, 'getAssignedCandidates'])->middleware('auth');
Route::get('/candidates/{candidate}/edit', [CandidateController::class, 'edit'])->name('candidates.edit');
Route::put('/candidates/{candidate}', [CandidateController::class, 'update'])->name('candidates.update');
Route::get('/api/candidates', [CandidateController::class, 'index']);
Route::post('/candidates', [CandidateController::class, 'store'])->name('candidates.store');
Route::delete('/api/candidates/{id}', [CandidateController::class, 'destroy']);


Route::get('/api/judges', [JudgeController::class, 'index']);
Route::delete('/api/judges/{id}', [JudgeController::class, 'destroy']);
Route::put('/judges/{judge}', [JudgeController::class, 'update'])->name('judges.update');
Route::delete('/judges/{id}', [JudgeController::class, 'destroy'])->name('judges.destroy');
Route::get('/register-judge', [JudgeController::class, 'create'])->name('register');
Route::post('/register-judge', [JudgeController::class, 'store']);

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');




Route::get('/l', function () {
    return Inertia::render('admin/Leaderboard'); 
})->name('Leaderboard');


Route::get('/ajs', function () {
    return Inertia::render('admin/AasignSegment'); 
})->name('AasignSegment');

Route::get('/ajc', function () {
    return Inertia::render('admin/AasignCandidate'); 
})->name('AasignCandidate');

Route::get('/as', function () {
    return Inertia::render('admin/Asegment'); 
})->name('Asegment');

Route::get('/ac', function () {
    return Inertia::render('admin/Acandidate'); 
})->name('Acandidate');

Route::get('/aj', function () {
    return Inertia::render('admin/Ajudge'); 
})->name('Ajudge');

Route::get('/143432', function () {
    return Inertia::render('admin/admin'); 
})->name('admin');


Route::get('/LeaderBoard', function () {
    return Inertia::render('user/UserLeaderboard'); 
})->name('UserLeaderboard');

Route::get('/FCscoring', function () {
    return Inertia::render('user/FCscoring'); 
})->name('FCscoring');

Route::get('/segment', function () {
    return Inertia::render('user/segment'); 
})->name('segment');

Route::get('/candidate', function () {
    return Inertia::render('user/candidate'); 
})->name('candidate');

Route::get('/dashboard', function () {
    return Inertia::render('user/user'); 
})->name('user');

Route::get('/', function () {
    return Inertia::render('Auth/Login'); 
});

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
});

Route::get('/test-auth', function () {
    return response()->json([
        'user' => auth()->user(),
    ]);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/scoring', function () {
        return Inertia::render('user/scoring'); // Ensure 'Scoring' matches your `scoring.jsx` file
    })->name('scoring'); // Ensure this route has a name
});