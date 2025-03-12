import React, { useState } from 'react';
import { BiSolidUser } from 'react-icons/bi'; // Import solo icon
import { HiUsers } from 'react-icons/hi'; // Import pair icon

const SegmentSelector = ({ segments, selectedSegmentId, onSelectSegment, setIsModalOpen }) => {
    const [displayMode, setDisplayMode] = useState('solo'); // State for display mode

    const soloSegments = segments.filter(segment => !segment.pair_name);
    const pairSegments = segments.filter(segment => segment.pair_name);

    return (
        <div className="space-y-8">
            {/* Display Mode Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setDisplayMode('solo')}
                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                        displayMode === 'solo'
                            ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                >
                    <BiSolidUser size={16} /> Solo Segments
                </button>
                <button
                    onClick={() => setDisplayMode('pair')}
                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                        displayMode === 'pair'
                            ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                >
                    <HiUsers size={16} /> Pair Segments
                </button>
            </div>

            {/* Solo Segments */}
            {displayMode === 'solo' && (
                <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Solo Segments</h4>
                    <div className="space-y-4">
                        {soloSegments.map((segment) => (
                            <button
                                key={segment.id}
                                className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                                    selectedSegmentId === segment.id
                                        ? 'bg-indigo-700 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-indigo-600 hover:text-white hover:shadow-md'
                                }`}
                                onClick={() => {
                                    onSelectSegment(segment.id);
                                    setIsModalOpen(false);
                                }}
                            >
                                <span className="text-lg font-medium">{segment.name}</span>
                                {selectedSegmentId === segment.id && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Pair Segments */}
            {displayMode === 'pair' && (
                <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Pair Segments</h4>
                    <div className="space-y-4">
                        {pairSegments.map((segment) => (
                            <button
                                key={segment.id}
                                className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                                    selectedSegmentId === segment.id
                                        ? 'bg-purple-700 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-purple-600 hover:text-white hover:shadow-md'
                                }`}
                                onClick={() => {
                                    onSelectSegment(segment.id);
                                    setIsModalOpen(false);
                                }}
                            >
                                <span className="text-lg font-medium">
                                    {segment.pair_name}
                                    <span className="text-sm text-gray-400 ml-2"></span>
                                </span>
                                {selectedSegmentId === segment.id && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SegmentSelector;