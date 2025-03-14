import React from 'react';
import { motion } from 'framer-motion';
import { FaRegFaceSadCry } from "react-icons/fa6";

const ScoringCandidates = ({ candidates, pairCandidates, setIsModalOpen, selectedCandidate, onSelect }) => {
    return (
        <div className="space-y-6">
            {/* Individual Candidates Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b-2 border-indigo-500 pb-2">
                    Individual Candidates
                </h4>
                <div className="space-y-4">
                    {candidates.map((candidate) => (
                        <button
                            key={candidate.id}
                            className={`w-full text-center p-3 rounded-lg transition mb-2 hover:bg-indigo-500 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                selectedCandidate === candidate.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200'
                            }`}
                            onClick={() => {
                                onSelect(candidate.id);
                                setIsModalOpen(false);
                            }}
                        >
                            <div className="flex flex-col items-center relative">
                                {selectedCandidate === candidate.id && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                 <img
        src={`/storage/${candidate.picture}`}
        alt={candidate.name}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg"
        loading="lazy"
        onError={(e) => e.target.style.display = 'none'}
    />
                                <span className="mt-2 text-sm font-medium">{candidate.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Pair Candidates Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-4 border-b-2 border-indigo-500 pb-2">
                    Pair Candidates
                </h4>
                <div className="space-y-6">
                    {pairCandidates.map((pair) => {
                        const isMaleSelected = selectedCandidate === `${pair.id}-male`;
                        const isFemaleSelected = selectedCandidate === `${pair.id}-female`;

                        const male = pair.male || {  isEliminated: true };
                        const female = pair.female || {  isEliminated: true };

                        return (
                            <div
                                key={pair.id}
                                className={`p-6 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                                    isMaleSelected || isFemaleSelected
                                        ? 'border-2 border-indigo-500 dark:border-indigo-400'
                                        : 'border border-indigo-100 dark:border-gray-700'
                                } bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900`}
                            >
                                {/* Pair Name and Status */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {pair.pair_name}
                                    </span>
                                    {(isMaleSelected || isFemaleSelected) && (
                                        <span className="text-sm bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                            Selected
                                        </span>
                                    )}
                                </div>

                                {/* Male and Female Candidates Side by Side */}
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    {/* Male Candidate */}
                                    <button
                                        className={`w-full md:w-1/2 text-center p-3 rounded-lg transition ${
                                            male.isEliminated
                                                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                                                : isMaleSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-indigo-500 hover:text-white hover:scale-105'
                                        }`}
                                        onClick={() => {
                                            if (!male.isEliminated) {
                                                onSelect(`${pair.id}-male`);
                                                setIsModalOpen(false);
                                            }
                                        }}
                                        disabled={male.isEliminated}
                                    >
                                        <div className="flex flex-col items-center">
                                            {male.isEliminated ? (
                                                <div className="flex flex-col items-center">
                                                     <FaRegFaceSadCry className="w-16 h-16 md:w-20 md:h-20 text-gray-500" />
                                                    <span className="mt-2 text-sm font-medium line-through text-gray-500 dark:text-gray-400">
                                                        Eliminated
                                                    </span>
                                                 
                                                </div>
                                            ) : (
                                                <>
                                                    <img
                                                      src={`/storage/${male.picture}`}
                                                      alt={male.name}
                                                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg"
                                                      loading="lazy"
                                                      onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                    <span className="mt-2 text-sm font-medium">{male.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* Divider */}
                                    <div className="hidden md:block w-px h-16 bg-gray-200 dark:bg-gray-600"></div>

                                    {/* Female Candidate */}
                                    <button
                                        className={`w-full md:w-1/2 text-center p-3 rounded-lg transition ${
                                            female.isEliminated
                                                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                                                : isFemaleSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-indigo-500 hover:text-white hover:scale-105'
                                        }`}
                                        onClick={() => {
                                            if (!female.isEliminated) {
                                                onSelect(`${pair.id}-female`);
                                                setIsModalOpen(false);
                                            }
                                        }}
                                        disabled={female.isEliminated}
                                    >
                                        <div className="flex flex-col items-center">
                                            {female.isEliminated ? (
                                                <div className="flex flex-col items-center">
                                                    <FaRegFaceSadCry className="w-16 h-16 md:w-20 md:h-20 text-gray-500" />
                                                    <span className="mt-2 text-sm font-medium line-through text-gray-500 dark:text-gray-400">
                                                        Eliminated
                                                    </span>
                                                
                                                </div>
                                            ) : (
                                                <>
                                                   <img
                                                     src={`/storage/${female.picture}`}
                                                     alt={female.name}
                                                     className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg"
                                                     loading="lazy"
                                                     onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                    <span className="mt-2 text-sm font-medium">{female.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default ScoringCandidates;