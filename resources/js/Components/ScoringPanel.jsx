import { useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SoloScoreInput from '@/Components/SoloScoreInput';
import PairScoreInput from '@/Components/PairScoreInput';

const ScoringPanel = ({
    selectedCandidate,
    candidates,
    pairCandidates,
    segments,
    pairJudgeSegments,
    scores,
    handleScoreChange,
    calculateTotalScore,
    calculateProgress,
    loading,
    lockedCandidates,
    handleSave,
    toggleLock,
    judgeCount, // Added prop for judge count
}) => {
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
    
    // Ensure selectedCandidate is treated as a string
    const selectedCandidateStr = useMemo(() => String(selectedCandidate), [selectedCandidate]);
    const isPairCandidate = useMemo(() => selectedCandidateStr.includes('-'), [selectedCandidateStr]);

    // Determine the selected candidate's gender
    const selectedGender = useMemo(() => {
        if (isPairCandidate) {
            return selectedCandidateStr.split('-')[1]; // "male" or "female"
        }
        return null;
    }, [isPairCandidate, selectedCandidateStr]);

    // Use pairJudgeSegments for pair candidates, otherwise use segments
    const displaySegments = useMemo(() => {
        if (isPairCandidate) {
            return pairJudgeSegments.filter((segment) => {
                // Filter segments based on the selected gender
                if (selectedGender === 'male') {
                    return segment.male_name;
                } else if (selectedGender === 'female') {
                    return segment.female_name;
                }
                return false;
            });
        }
        return segments;
    }, [isPairCandidate, pairJudgeSegments, selectedGender, segments]);

    // Get the candidate's name with gender label for pair candidates
    const candidateName = useMemo(() => {
        if (!selectedCandidateStr) return null;

        if (isPairCandidate) {
            const pairId = selectedCandidateStr.split('-')[0];
            const pairCandidate = pairCandidates.find((p) => p.id === Number(pairId));
            if (!pairCandidate) return 'Unknown Pair Candidate';

            const individualName = selectedGender === 'male' 
                ? pairCandidate.male.name 
                : pairCandidate.female.name;

            const genderLabel = selectedGender === 'male' ? '(Male)' : '(Female)';
            return `${individualName} ${genderLabel}`;
        } else {
            const candidateId = Number(selectedCandidateStr);
            const candidate = candidates.find((c) => c.id === candidateId);
            return candidate?.name || 'Unknown Candidate';
        }
    }, [selectedCandidateStr, isPairCandidate, pairCandidates, candidates, selectedGender]);

    // Check if the selected candidate is locked
    const isLocked = useMemo(() => lockedCandidates.includes(selectedCandidateStr), [lockedCandidates, selectedCandidateStr]);


    
    // Handle score input changes with validation
const handleScoreInputChange = (segmentId, criterionId, value) => {
    // Allow empty string (when backspacing to clear)
    if (value === '') {
        handleScoreChange(segmentId, criterionId, '0'); // Set to 0 when cleared
        return;
    }
    
    // Allow single character input (like '1' or '0') without requiring full number
    if (/^[0-9]$/.test(value)) {
        handleScoreChange(segmentId, criterionId, value);
        return;
    }
    
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) {
        toast.error('Please enter a valid number between 1-10');
        return;
    }
    
    if (numericValue < 0 || numericValue > 10) {
        toast.error('Scores must be between 1 and 10');
        return;
    }
    
    handleScoreChange(segmentId, criterionId, value);
};

    const totalScore = calculateTotalScore(
        scores,
        segments,
        pairJudgeSegments,
        isPairCandidate,
        selectedGender
    );

    const progress = calculateProgress(
        scores,
        segments,
        pairJudgeSegments,
        isPairCandidate,
        selectedGender
    );

    return (
        <div className="lg:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl relative">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pb-4">
                {/* Conditional Rendering for Candidate Selection Message or Scoring Panel */}
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
                    {!selectedCandidateStr || selectedCandidateStr === 'null' || selectedCandidateStr === 'undefined' ? (
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                                Please Select a Candidate First
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Choose a candidate from the list to start scoring.
                            </p>
                        </div>
                    ) : (
                        <>
                            Scoring for <br />
                            <span className="text-indigo-600 dark:text-indigo-400">{candidateName}</span>
                        </>
                    )}
                </h3>

                {/* Conditionally Render Segments, Criteria, and Other Elements */}
                {selectedCandidateStr && selectedCandidateStr !== 'null' && selectedCandidateStr !== 'undefined' && (
                    <>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-800 mb-6">
                            <div
                                className="h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        {/* Segments and Criteria */}
                        {displaySegments?.length > 0 ? (
                            displaySegments.map((segment) => (
                                <div key={segment.id} className="mb-8">
                                    <h4 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center uppercase">
                                        {segment.pair_name || segment.name}
                                    </h4>
                                    <div className="space-y-2">
                                        {(isPairCandidate ? segment.paircriteria : segment.criteria)
                                            ?.filter((criterion) => !isPairCandidate || criterion.type === selectedGender)
                                            ?.map((criterion) => (
                                                isPairCandidate ? (
                                                    <PairScoreInput
                                                        key={criterion.id}
                                                        segmentId={segment.id}
                                                        criterion={criterion}
                                                        value={scores[segment.id]?.[criterion.id] || ''}
                                                        onChange={handleScoreInputChange}
                                                        disabled={!selectedCandidateStr || isLocked}
                                                        gender={selectedGender}
                                                    />
                                                ) : (
                                                    <SoloScoreInput
                                                        key={criterion.id}
                                                        segmentId={segment.id}
                                                        criterion={criterion}
                                                        value={scores[segment.id]?.[criterion.id] || ''}
                                                        onChange={handleScoreInputChange}
                                                        disabled={!selectedCandidateStr || isLocked}
                                                    />
                                                )
                                            ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No segments available for scoring.</p>
                        )}

                        {/* Total Score and Buttons */}
                        <div className="flex flex-col items-center mt-6 space-y-4">
                            <span className="text-base text-gray-500">Note: Scoring is between 0-10</span>
                            
                            <div className="text-center">
                                <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                                    <span className="text-lg text-white-500">Total Score: </span>
                                    <span className="border-b-2 border-gray-700 px-4">{totalScore}%</span>
                                </span>
                               
                               
                            </div>

                            <button
                                className="w-48 px-8 py-3 border-2 border-indigo-500 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white text-lg font-bold transition-all mt-6"
                                onClick={handleSave}
                                disabled={loading || isLocked}
                                aria-label="Save scores"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </div>
                                ) : 'Save'}
                            </button>

                            <button
                                className={`px-4 py-2 rounded-lg transition duration-300 flex items-center ${
                                    isLocked 
                                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                                onClick={() => toggleLock(selectedCandidateStr)}
                                disabled={!selectedCandidateStr}
                                aria-label={isLocked ? "Unlock scores" : "Lock scores"}
                            >
                                {isLocked ? (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Scores Locked
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                        Lock Scores
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

         

            <ToastContainer />
        </div>
    );
};

export default ScoringPanel;