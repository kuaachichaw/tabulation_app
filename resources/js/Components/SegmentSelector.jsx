import React from 'react';

const SegmentSelector = ({ segments, selectedSegmentId, onSelectSegment, setIsModalOpen }) => {
    return (
        <div className="space-y-4">
            {segments.map((segment) => (
                <button
                    key={segment.id}
                    className={`w-full text-center p-3 rounded-lg transition ${
                        selectedSegmentId === segment.id
                            ? 'bg-indigo-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'
                    }`}
                    onClick={() => {
                        onSelectSegment(segment.id); // Handle segment selection
                        setIsModalOpen(false);
                    }}
                >
                    <span className="text-lg font-medium">{segment.name}</span>
                </button>
            ))}
        </div>
    );
};

export default SegmentSelector;