import { useState } from 'react';
import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExportCSVModal from '@/Modal/ExportCSVModal';
import OverallLeaderboardModal from '@/Modal/OverallLeaderboardModal';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag';
import { BiLogoSlack, BiSolidUser, BiDownload, BiCog } from "react-icons/bi";
import LeaderboardTypeSelector from '@/Components/LeaderboardTypeSelector';
import { useLeaderboardBackend } from '@/BackEnd/LeaderboardBackEnd.jsx';
import { HiUsers } from 'react-icons/hi';
import { FaFemale, FaMale, FaFilter } from "react-icons/fa";
import { SoloLeaderBoard } from '@/Components/SoloLeaderBoard';
import { PairLeaderBoard } from '@/Components/PairLeaderBoard';

export default function Leaderboard() {
    const [displayMode, setDisplayMode] = useState('solo');
    const [genderFilter, setGenderFilter] = useState(null);

    const {
        segments,
        pairSegments,
        selectedSegmentId,
        setSelectedSegmentId,
        leaderboard,
        loading,
        error,
        judges,
        isOverall,
        setIsOverall,
    } = useLeaderboardBackend(displayMode);

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isOverallSetupOpen, setIsOverallSetupOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);
    const selectedPairSegment = pairSegments.find(segment => segment.id === selectedSegmentId);

    const handleModeChange = (mode) => {
        setDisplayMode(mode);
        setGenderFilter(null);
        setSelectedSegmentId(null);
    };

    return (
        <AdminLayout 
            header={
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Competition Leaderboard
                </h2>
            }
        >
            <Head title="Leaderboard" />
            
            {/* Main Container */}
            <div className="space-y-6">
                {/* Display Mode Toggle */}
                <div className="w-full">
                    <div className="flex justify-center">
                        <div className="inline-flex rounded-lg shadow-sm" role="group">
                            <button
                                onClick={() => handleModeChange('solo')}
                                className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-colors duration-200 flex items-center gap-2 ${
                                    displayMode === 'solo'
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                                <BiSolidUser className="w-4 h-4" /> Solo
                            </button>
                            <button
                                onClick={() => handleModeChange('pair')}
                                className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition-colors duration-200 flex items-center gap-2 ${
                                    displayMode === 'pair'
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                                <HiUsers className="w-4 h-4" /> Pair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gender Filter (only shown in pair mode) */}
                {displayMode === 'pair' && (
                    <div className="w-full">
                        <div className="flex flex-col items-center">
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button
                                    onClick={() => setGenderFilter('female')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-md border transition-colors duration-200 flex items-center gap-2 ${
                                        genderFilter === 'female'
                                            ? 'bg-pink-600 text-white border-pink-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <FaFemale className="w-4 h-4" /> Female
                                </button>
                                <button
                                    onClick={() => setGenderFilter('male')}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-md border transition-colors duration-200 flex items-center gap-2 ${
                                        genderFilter === 'male'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <FaMale className="w-4 h-4" /> Male
                                </button>
                            </div>
                            {!selectedSegmentId && pairSegments.length > 0 && (
                                <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                    <FaFilter className="w-3 h-3" /> 
                                    Please select Male or Female Candidate and Choose a Segment
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <FlexContainer>
                    {/* Sidebar - Segments List & Overall Toggle */}
                    <div className="hidden lg:block md:hidden bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="sticky top-4">
                            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                                <BiCog className="w-4 h-4" />
                                Leaderboard Settings
                            </h3>
                            <LeaderboardTypeSelector
                                isOverall={isOverall}
                                setIsOverall={setIsOverall}
                                setIsModalOpen={setIsModalOpen}
                                segments={displayMode === 'pair' ? pairSegments : segments}
                                selectedSegmentId={selectedSegmentId}
                                setSelectedSegmentId={setSelectedSegmentId}
                                displayMode={displayMode}
                            />
                        </div>
                    </div>

                    {isSmallScreen && (
                        <>
                            {/* Draggable Button */}
                            <motion.button
                                style={buttonStyle}
                                className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center z-40"
                                onClick={() => setIsModalOpen((prev) => !prev)}
                                onMouseDown={onMouseDown}
                                onTouchStart={onTouchStart}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <BiLogoSlack className="w-5 h-5" />
                            </motion.button>

                            {/* Modal for Selecting a Segment */}
                            {isModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                                    <motion.div 
                                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md"
                                        onClick={(e) => e.stopPropagation()}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                                            <BiCog className="w-5 h-5" />
                                            Leaderboard Settings
                                        </h3>
                                        <LeaderboardTypeSelector
                                            isOverall={isOverall}
                                            setIsOverall={setIsOverall}
                                            setIsModalOpen={setIsModalOpen}
                                            segments={displayMode === 'pair' ? pairSegments : segments}
                                            selectedSegmentId={selectedSegmentId}
                                            setSelectedSegmentId={setSelectedSegmentId}
                                            displayMode={displayMode}
                                        />
                                        <div className="flex justify-center mt-4">
                                            <button
                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Main Content - Leaderboard Display */}
                    <div className="col-span-3 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 relative">
                        {/* Header with title and actions */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                                    {isOverall 
                                        ? '🏆 Overall Leaderboard' 
                                        : displayMode === 'pair' 
                                            ? selectedPairSegment?.pair_name || 'Pair Leaderboard'
                                            : selectedSegment?.name || 'Leaderboard'}
                                    {displayMode === 'pair' && genderFilter && (
                                        <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                                            genderFilter === 'female' 
                                                ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                        }`}>
                                            {genderFilter === 'female' ? 'Female' : 'Male'}
                                        </span>
                                    )}
                                </h3>
                                {selectedSegment?.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {selectedSegment.description}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                {isOverall && (
                                    <button
                                        onClick={() => setIsOverallSetupOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                                    >
                                        <BiCog className="w-4 h-4" />
                                        <span className="hidden sm:inline">Setup</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                                    disabled={displayMode === 'pair' && (!genderFilter || !selectedSegmentId)}
                                >
                                    <BiDownload className="w-4 h-4" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading & Error Handling */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 space-y-4">
                                <p className="text-red-500 text-lg">Error loading leaderboard data</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : displayMode === 'pair' ? (
                            !selectedSegmentId ? (
                                <div className="text-center py-8 space-y-2">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Please select a segment to view pair leaderboard
                                    </p>
                                </div>
                            ) : genderFilter ? (
                                <PairLeaderBoard 
                                    leaderboard={leaderboard}
                                    isOverall={isOverall}
                                    segmentName={selectedPairSegment?.pair_name}
                                    genderFilter={genderFilter}
                                />
                            ) : (
                                <div className="text-center py-8 space-y-2">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Please select Male or Female candidates and choose a Segment
                                    </p>
                                </div>
                            )
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-8 space-y-2">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {isOverall 
                                        ? 'No overall scores available yet'
                                        : 'Select a Segment to Display Candidates Score'}
                                </p>
                            </div>
                        ) : (
                            <SoloLeaderBoard 
                                leaderboard={leaderboard}
                                isOverall={isOverall}
                            />
                        )}
                    </div>
                </FlexContainer>
            </div>

            {/* Modals */}
            <ExportCSVModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                leaderboard={leaderboard}
                segments={displayMode === 'pair' ? pairSegments : segments}
                selectedSegmentId={selectedSegmentId}
                isOverall={isOverall}
                judges={judges}
                displayMode={displayMode}
                genderFilter={genderFilter}
            />
            
            <OverallLeaderboardModal
                isOpen={isOverallSetupOpen}
                closeModal={() => setIsOverallSetupOpen(false)}
                segments={displayMode === 'pair' ? pairSegments : segments}
            />

            <ToastContainer position="bottom-right" autoClose={3000} />
        </AdminLayout>
    );
}