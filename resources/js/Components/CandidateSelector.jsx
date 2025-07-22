import React from 'react';

const CandidateSelector = ({ judges, selectedJudge, onSelectJudge, setIsModalOpen }) => {
    return (
        <div className="space-y-4">
            {judges.map((judge) => (
                <button
                    key={judge.id}
                    className={`w-full text-center p-3 rounded-lg transition ${
                        selectedJudge === judge.id
                            ? 'bg-indigo-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'
                    }`}
                    onClick={() => {
                        onSelectJudge(judge.id);
                        setIsModalOpen?.(false); // Optional chaining
                    }}
                >
                    <div className="flex flex-col items-center">
                        <img
                            src={`/storage/${judge.picture}`}
                            alt={judge.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <span className="text-lg font-medium">{judge.name}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default CandidateSelector;