import React from 'react';

const LeaderboardTypeSelector = ({ 
    isOverall, 
    setIsOverall,
    setIsModalOpen, 
    segments, 
    selectedSegmentId, 
    setSelectedSegmentId,
    displayMode = 'solo' // Add displayMode prop
}) => {
    return (
        <div className="space-y-4">
            {/* Overall Leaderboard Button */}
            <button
                className={`w-full text-center p-3 rounded-lg transition mb-2 ${
                    isOverall
                        ? 'bg-indigo-700 text-white font-bold'
                        : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'
                }`}
                onClick={() => {
                    setIsOverall(true);
                    setIsModalOpen(false);
                }}
            >
                Overall Leaderboard
            </button>

            {/* Segment Selection Header */}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                {displayMode === 'pair' ? 'Select Pair Segment' : 'Select Segment'}
            </h3>
            
            {/* Segment List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {segments.map((segment) => (
                    <button
                        key={segment.id}
                        className={`w-full text-center p-3 rounded-lg transition ${
                            !isOverall && selectedSegmentId === segment.id
                                ? 'bg-indigo-700 text-white font-bold'
                                : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'
                        }`}
                        onClick={() => {
                            setSelectedSegmentId(segment.id);
                            setIsOverall(false);
                            setIsModalOpen(false);
                        }}
                    >
                        {/* Display pair_name for pair mode, name for solo mode */}
                        {displayMode === 'pair' ? segment.pair_name : segment.name}
                       
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {segments.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No {displayMode === 'pair' ? 'pair' : ''} segments available
                </div>
            )}
        </div>
    );
};

export default LeaderboardTypeSelector;