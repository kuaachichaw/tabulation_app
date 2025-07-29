import React, { useState } from 'react';
import { BiSolidUser } from 'react-icons/bi';
import { HiUsers } from 'react-icons/hi';

const SegmentSelector = ({ 
  segments = [], 
  selectedSegmentId, 
  onSelectSegment, 
  setIsModalOpen = null 
}) => {
    const [displayMode, setDisplayMode] = useState('solo');
    
    // Safely filter segments
    const soloSegments = segments?.filter(segment => !segment.pair_name) || [];
    const pairSegments = segments?.filter(segment => segment.pair_name) || [];

    const handleSegmentClick = (segmentId) => {
        onSelectSegment(segmentId);
        // Safely call setIsModalOpen if provided
        if (typeof setIsModalOpen === 'function') {
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-6 p-4">
            {/* Display Mode Toggle */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => setDisplayMode('solo')}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base border ${
                        displayMode === 'solo'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <BiSolidUser className="shrink-0" /> 
                    <span>Solo</span>
                </button>
                <button
                    onClick={() => setDisplayMode('pair')}
                    className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base border ${
                        displayMode === 'pair'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <HiUsers className="shrink-0" />
                    <span>Pair</span>
                </button>
            </div>

            {/* Segments List */}
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
                {displayMode === 'solo' ? (
                    <SegmentList 
                        segments={soloSegments}
                        selectedSegmentId={selectedSegmentId}
                        onSelect={handleSegmentClick}
                        emptyMessage="No solo segments available"
                    />
                ) : (
                    <SegmentList 
                        segments={pairSegments}
                        selectedSegmentId={selectedSegmentId}
                        onSelect={handleSegmentClick}
                        emptyMessage="No pair segments available"
                        isPair
                    />
                )}
            </div>
        </div>
    );
};

// Sub-component for segments list
const SegmentList = ({ segments, selectedSegmentId, onSelect, emptyMessage, isPair = false }) => {
    if (segments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {segments.map((segment) => (
                <button
                    key={segment.id}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 border ${
                        selectedSegmentId === segment.id
                            ? `${isPair ? 'bg-purple-100 border-purple-500 dark:bg-purple-900/30' : 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900/30'} font-medium`
                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => onSelect(segment.id)}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-gray-800 dark:text-gray-200">
                            {segment.pair_name || segment.name}
                        </span>
                        {selectedSegmentId === segment.id && (
                            <svg 
                                className={`w-5 h-5 ${isPair ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};

export default SegmentSelector;