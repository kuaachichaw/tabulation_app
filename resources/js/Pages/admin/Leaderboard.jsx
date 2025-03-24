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
import { BiLogoSlack } from "react-icons/bi";
import LeaderboardTypeSelector from '@/Components/LeaderboardTypeSelector';
import { useLeaderboardBackend } from '@/BackEnd/LeaderboardBackEnd.jsx';
import { BiSolidUser } from 'react-icons/bi';
import { HiUsers } from 'react-icons/hi';
import { SoloLeaderBoard } from '@/Components/SoloLeaderBoard';

export default function Leaderboard() {
    const {
        segments,
        selectedSegmentId,
        setSelectedSegmentId,
        leaderboard,
        loading,
        error,
        judges,
        isOverall,
        setIsOverall,
    } = useLeaderboardBackend();

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isOverallSetupOpen, setIsOverallSetupOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState('solo');
    
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);

    return (
        <AdminLayout header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Leaderboard</h2>}>
            <Head title="Leaderboard" />
            
            {/* Display Mode Toggle */}
            <div className="w-full flex justify-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setDisplayMode('solo')}
                        className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                            displayMode === 'solo'
                                ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                    >
                        <BiSolidUser size={16} /> Solo Candidates
                    </button>
                    <button
                        onClick={() => setDisplayMode('pair')}
                        className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                            displayMode === 'pair'
                                ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                    >
                        <HiUsers size={16} /> Pair Candidates
                    </button>
                </div>
            </div>

            <FlexContainer>
                {/* Sidebar - Segments List & Overall Toggle */}
                <div className="hidden lg:block md:hidden bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="sticky top-0 z-10">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Leaderboard Type</h3>
                        <LeaderboardTypeSelector
                            isOverall={isOverall}
                            setIsOverall={setIsOverall}
                            setIsModalOpen={setIsModalOpen}
                            segments={segments}
                            selectedSegmentId={selectedSegmentId}
                            setSelectedSegmentId={setSelectedSegmentId}
                        />
                    </div>
                </div>

                {isSmallScreen && (
                    <>
                        {/* Draggable Button */}
                        <button
                            style={buttonStyle}
                            className="p-3 md:p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
                            onClick={() => setIsModalOpen((prev) => !prev)}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            <BiLogoSlack className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                        </button>

                        {/* Modal for Selecting a Segment */}
                        {isModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Leaderboard Type</h3>
                                    <LeaderboardTypeSelector
                                        isOverall={isOverall}
                                        setIsOverall={setIsOverall}
                                        setIsModalOpen={setIsModalOpen}
                                        segments={segments}
                                        selectedSegmentId={selectedSegmentId}
                                        setSelectedSegmentId={setSelectedSegmentId}
                                    />
                                    <div className="flex justify-center">
                                        <button
                                            className="mt-4 px-4 py-2 bg-red-300 dark:bg-red-600 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-400 dark:hover:bg-red-500 transition duration-300"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Main Content - Leaderboard Display */}
                <div className="col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">
                            {isOverall ? 'Overall Leaderboard' : selectedSegment?.name || 'Leaderboard'} - {displayMode === 'solo' ? 'Solo' : 'Pair'}
                        </h3>
                        <div className="flex gap-2 md:gap-3 mt-2 md:mt-0">
                            {isOverall && (
                                <button
                                    onClick={() => setIsOverallSetupOpen(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 md:py-2 px-3 md:px-4 rounded-lg text-sm md:text-base"
                                >
                                    Overall Setup
                                </button>
                            )}
                            <button
                                onClick={() => setIsExportModalOpen(true)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 md:py-2 px-3 md:px-4 rounded-lg text-sm md:text-base"
                            >
                                Download CSV
                            </button>
                        </div>
                    </div>

                    {/* Loading & Error Handling */}
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="animate-spin h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : leaderboard.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">Judges did not Score this Segment Yet..</p>
                    ) : (
                        <>
                            {displayMode === 'solo' ? (
                                <SoloLeaderBoard 
                                    leaderboard={leaderboard}
                                    isOverall={isOverall}
                                />
                            ) : (
                                <div className="text-center py-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <h3 className="text-xl font-semibold mb-4">Pair Leaderboard</h3>
                                    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Pair leaderboard functionality is coming soon.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </FlexContainer>

            {/* Modals */}
            <ExportCSVModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                leaderboard={leaderboard}
                segments={segments}
                selectedSegmentId={selectedSegmentId}
                isOverall={isOverall}
                judges={judges}
                displayMode={displayMode}
            />
            <OverallLeaderboardModal
                isOpen={isOverallSetupOpen}
                closeModal={() => setIsOverallSetupOpen(false)}
                segments={segments}
            />

            <ToastContainer />
        </AdminLayout>
    );
}