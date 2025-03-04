const ScoringSelector = ({ candidates, topCandidates, selectedCandidate, onSelect, setIsModalOpen }) => {
    return (
        <div className="space-y-4">
            {candidates.map((candidate) => {
                // Check if the candidate is in the topCandidates array
                const topCandidate = topCandidates.find(top => top.id === candidate.id);
                return (
                    <button
                        key={candidate.id}
                        className={`w-full text-center p-3 rounded-lg transition mb-2 ${
                            selectedCandidate === candidate.id 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => {
                            onSelect(candidate.id);
                            setIsModalOpen(false); 
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <img 
                                src={candidate.picture ? `/storage/${candidate.picture}` : '/default-avatar.png'} 
                                alt={candidate.name} 
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg" 
                            />
                            <span className="mt-2">
                                {candidate.name} {topCandidate && <span className="badgeBounce absolute " >{topCandidate.medal}</span>}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default ScoringSelector;