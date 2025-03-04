import React from 'react';

const LeaderboardTypeSelector = ({ isOverall, setIsOverall,setIsModalOpen, segments, selectedSegmentId, setSelectedSegmentId }) => {
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

            {/* Segment Selection */}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">
                Select a Segment
            </h3>
            <div className="space-y-4">
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
                        {segment.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardTypeSelector;