import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag';
import CandidateSelector from '@/Components/CandidateSelector';
import { BiLogoSlack, BiSolidUser, BiSave, BiUserX } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";
import { AnimatedToggle } from "@/Components/AnimatedToggle";
import { useAssignCandidateBackend } from '@/BackEnd/AssignCandidateBackend';

export default function AssignCandidate() {
    const [displayMode, setDisplayMode] = useState('solo');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    const {
        judges,
        candidates,
        pairCandidates,
        selectedJudge,
        setSelectedJudge,
        assignments,
        selectAll,
        loading,
        handleToggle,
        handleSelectAll,
        handleSave
    } = useAssignCandidateBackend(displayMode);

    const handleConfirmSave = async () => {
        const success = await handleSave();
        setShowConfirm(!success);
    };

    return (
        <AdminLayout header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Assign Judge to Candidates</h2>}>
            <Head title="Assign Candidate" />
            
            <FlexContainer>
                {/* Sidebar - Judge Selection */}
                {!isSmallScreen && (
                    <div className="hidden lg:block md:hidden bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="sticky top-0 z-10">
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
                                Select a Judge
                            </h3>
                            <CandidateSelector
                                judges={judges}
                                selectedJudge={selectedJudge}
                                onSelectJudge={setSelectedJudge}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Judge Selection */}
                {isSmallScreen && (
                    <>
                        <button
                            style={buttonStyle}
                            className="p-3 md:p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
                            onClick={() => setIsModalOpen(true)}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            <BiLogoSlack className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {isModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">
                                        Select a Judge
                                    </h3>
                                    <CandidateSelector
                                        judges={judges}
                                        selectedJudge={selectedJudge}
                                        onSelectJudge={setSelectedJudge}
                                        onClose={() => setIsModalOpen(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Main Content */}
                <div className="col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                    {/* Judge Selection Indicator */}
                    {selectedJudge && (
                        <div className="mb-6 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center">
                            <BiSolidUser className="mr-2 text-indigo-600 dark:text-indigo-300" />
                            <span className="font-bold">Selected Judge: </span>
                            <span className="ml-2 text-indigo-700 dark:text-indigo-200">
                                {judges.find(j => j.id === selectedJudge)?.name}
                            </span>
                        </div>
                    )}

                    {/* Header Section */}
                    <div className="py-1">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="overflow-hidden bg-white dark:bg-gray-800 shadow rounded-xl">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Candidate Management
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {displayMode === 'solo' 
                                                ? "Manage individual candidates" 
                                                : "Manage paired candidates"}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="inline-flex rounded-md shadow-sm">
                                            <button
                                                onClick={() => setDisplayMode('solo')}
                                                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                                                    displayMode === 'solo'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <BiSolidUser size={16} /> Solo
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => setDisplayMode('pair')}
                                                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors duration-200 ${
                                                    displayMode === 'pair'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <HiUsers size={16} /> Pair
                                                </span>
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                                Select All
                                            </span>
                                            <AnimatedToggle 
                                                isOn={selectAll === true} 
                                                onClick={handleSelectAll} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    {candidates.length === 0 && !loading && (
                        <div className="col-span-3 text-center py-12">
                            <BiUserX className="mx-auto text-5xl text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                                No candidates available
                            </h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                Please add candidates first before assigning judges
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {candidates.length === 0 && loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"></div>
                            ))}
                        </div>
                    )}

                    {/* Candidates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayMode === 'solo'
                            ? candidates.map((candidate) => (
                                <CandidateCard 
                                    key={candidate.id}
                                    candidate={candidate}
                                    isAssigned={assignments[candidate.id]}
                                    onToggle={() => handleToggle(candidate.id)}
                                    displayMode={displayMode}
                                />
                            ))
                            : pairCandidates.map((pair) => (
                                <PairCandidateCard 
                                    key={pair.id}
                                    pair={pair}
                                    assignments={assignments[pair.id]}
                                    onToggle={handleToggle}
                                />
                            ))}
                    </div>

                    {/* Save Button */}
                    {candidates.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button 
                                onClick={() => setShowConfirm(true)}
                                disabled={!selectedJudge || loading}
                                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center
                                    ${selectedJudge 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                    }
                                    ${loading && 'opacity-75'}
                                `}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <BiSave className="mr-2" />
                                )}
                                Save Assignments
                            </button>
                        </div>
                    )}
                </div>
            </FlexContainer>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md">
                        <h3 className="text-lg font-medium mb-4 dark:text-white">Confirm Assignments</h3>
                        <p className="dark:text-gray-300">
                            Are you sure you want to assign these candidates to the judge?
                        </p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmSave}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={3000} />
        </AdminLayout>
    );
}

// Candidate Card Component
const CandidateCard = ({ candidate, isAssigned, onToggle }) => (
    <div className={`relative bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        border-l-4 ${isAssigned ? 'border-green-500' : 'border-transparent'}`}
    >
        {isAssigned && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Assigned
            </div>
        )}
        <img 
            src={`/storage/${candidate.picture}`} 
            alt={candidate.name} 
            className="w-24 h-24 rounded-full object-cover mb-4 mx-auto"
        />
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
            {candidate.name}
        </h4>
        <div className="mt-4 flex justify-center">
            <AnimatedToggle 
                isOn={isAssigned} 
                onClick={onToggle} 
            />
        </div>
    </div>
);

// Pair Candidate Card Component
const PairCandidateCard = ({ pair, assignments, onToggle }) => (
    <div className="relative bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4 text-center">
            {pair.pair_name}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6">
            <CandidateCard 
                candidate={{
                    id: pair.id,
                    name: pair.female_name,
                    picture: pair.female_picture
                }}
                isAssigned={assignments?.female}
                onToggle={() => onToggle(pair.id, 'female')}
                color="pink"
            />
            
            <CandidateCard 
                candidate={{
                    id: pair.id,
                    name: pair.male_name,
                    picture: pair.male_picture
                }}
                isAssigned={assignments?.male}
                onToggle={() => onToggle(pair.id, 'male')}
                color="blue"
            />
        </div>
    </div>
);