import { useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IndividualScoreInput from '@/Components/IndividualScoreInput';
import PairScoreInput from '@/Components/PairScoreInput';

const ScoringPanel = ({
    selectedCandidate,
    candidates,
    pairCandidates,
    segments,
    pairJudgeSegments,
    scores,
    handleScoreChange, // Use the function passed from the parent
    calculateTotalScore,
    calculateProgress,
    loading,
    lockedCandidates,
    handleSave,
    toggleLock,
}) => {
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
                    return segment.male_name; // Display segments for male candidates
                } else if (selectedGender === 'female') {
                    return segment.female_name; // Display segments for female candidates
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
            // For pair candidates, extract the ID and find the candidate
            const pairId = selectedCandidateStr.split('-')[0];
            const pairCandidate = pairCandidates.find((p) => p.id === Number(pairId));
            if (!pairCandidate) return 'Unknown Pair Candidate';

            // Get the individual candidate's name based on the selected gender
            const individualName = selectedGender === 'male' 
                ? pairCandidate.male.name 
                : pairCandidate.female.name;

            // Add gender label
            const genderLabel = selectedGender === 'male' ? '(Male)' : '(Female)';
            return `${individualName} ${genderLabel}`;
        } else {
            // For individual candidates, find the candidate by ID
            const candidateId = Number(selectedCandidateStr);
            const candidate = candidates.find((c) => c.id === candidateId);
            return candidate?.name || 'Unknown Candidate';
        }
    }, [selectedCandidateStr, isPairCandidate, pairCandidates, candidates, selectedGender]);

    // Check if the selected candidate is locked
    const isLocked = useMemo(() => lockedCandidates.includes(selectedCandidateStr), [lockedCandidates, selectedCandidateStr]);

    // Handle score input changes
    const handleScoreInputChange = (segmentId, criterionId, value) => {
        handleScoreChange(segmentId, criterionId, value);
    };

    const totalScore = calculateTotalScore(
        scores,
        segments,
        pairJudgeSegments,
        isPairCandidate, // Use isPairCandidate here
        selectedGender
      );
      
      const progress = calculateProgress(
        scores,
        segments,
        pairJudgeSegments,
        isPairCandidate, // Use isPairCandidate here
        selectedGender
      );

    return (
        <div className="lg:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl relative">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
                    {selectedCandidateStr ? (
                        <>
                            Scoring for <br />
                            <span className="text-indigo-600 dark:text-indigo-400">{candidateName}</span>
                        </>
                    ) : (
                        "Select a Candidate First"
                    )}
                </h3>

                {/* Progress Bar */}
                <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-800 mb-6">
  <div
    className="h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
    style={{ width: `${progress}%` }}
  ></div>
</div>

                {selectedCandidateStr && (
                    <>
                        {displaySegments?.length > 0 ? (
                            displaySegments.map((segment) => (
                                <div key={segment.id} className="mb-8">
                                    <h4 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center uppercase">
                                        {segment.pair_name || segment.name}
                                    </h4>
                                    <div className="space-y-2">
                                        {(isPairCandidate ? segment.paircriteria : segment.criteria)
                                            ?.filter((criterion) => !isPairCandidate || criterion.type === selectedGender) // Filter criteria by selected gender
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
                                                    <IndividualScoreInput
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

                        <div className="flex flex-col items-center mt-6 space-y-4">
                            <span className="text-base text-gray-500">Note: Scoring is between 0-10</span>
                            <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
  <span className="text-lg text-white-500">Total Score: </span>
  <span className="border-b-2 border-gray-700 px-4">{totalScore}%</span>
</span>

                            <button
    className="w-48 px-8 py-3 border-2 border-indigo-500 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white text-lg font-bold transition-all mt-6"
    onClick={handleSave} // or onClick={PairhandleSave} for pair candidates
    disabled={loading || isLocked}
    aria-label="Save scores"
>
    {loading ? 'Saving...' : 'Save'}
</button>

                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                                onClick={() => toggleLock(selectedCandidateStr)}
                                disabled={!selectedCandidateStr}
                                aria-label={isLocked ? "Unlock scores" : "Lock scores"}
                            >
                                {isLocked ? "Unlock Scores" : "Lock Scores"}
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