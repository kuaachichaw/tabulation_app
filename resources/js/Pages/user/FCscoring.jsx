import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BsPersonLinesFill, BsArrowLeft } from "react-icons/bs";
import useDrag from '@/Components/useDrag';
import ScoringCandidates from '@/Components/ScoringCandidates';
import ScoringPanel from '@/Components/ScoringPanel';
import { useSwipeable } from 'react-swipeable';
import {
    API_ENDPOINTS,
    TOAST_MESSAGES,
    fetchData,
    handleSave,
    calculateTotalScore,
    handleCandidateSelection,
    toggleLock,
    calculateProgress,
    PairhandleSave,
} from '@/BackEnd/ScoringBackEnd.jsx';

export default function FCScoring() {
    const [candidates, setCandidates] = useState([]);
    const [pairCandidates, setPairCandidates] = useState([]);
    const [pairJudgeSegments, setPairJudgeSegments] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [segments, setSegments] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [lockedCandidates, setLockedCandidates] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const selectedCandidateStr = String(selectedCandidate);
    const isPairCandidate = selectedCandidateStr.includes('-');
    const selectedGender = isPairCandidate ? selectedCandidateStr.split('-')[1] : null;

    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setIsModalOpen(false),
        onSwipedRight: () => setIsModalOpen(true),
    });

    // Fetch data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const data = await fetchData();
                if (data) {
                    setCandidates(data.candidates);
                    setPairCandidates(data.pairCandidates);
                    setSegments(data.segments);
                    setPairJudgeSegments(data.pairJudgeSegments);
                }
            } catch (error) {
                toast.error(TOAST_MESSAGES.LOADING_ERROR);
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        };
        fetchInitialData();
    }, []);

    // Handle candidate selection
    const handleSelectCandidate = async (candidateId) => {
        try {
            await handleCandidateSelection(
                candidateId,
                setSelectedCandidate,
                setScores,
                segments,
                pairJudgeSegments
            );
        } catch (error) {
            toast.error(TOAST_MESSAGES.LOADING_ERROR);
            console.error("Error selecting candidate:", error);
        }
    };

    // Handle score changes
    const handleScoreInputChange = (segmentId, criterionId, value) => {
        if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
            setScores((prev) => ({
                ...prev,
                [segmentId]: {
                    ...prev[segmentId],
                    [criterionId]: value === "" ? null : parseFloat(value),
                },
            }));
        } else {
            toast.error("Score must be between 1 and 10.");
        }
    };

    // Handle save scores
    const handleSaveScores = async () => {
        try {
            if (!selectedCandidate) {
                toast.error(TOAST_MESSAGES.SELECT_CANDIDATE);
                return;
            }

            const selectedCandidateStr = String(selectedCandidate);

            if (selectedCandidateStr.includes('-')) {
                await PairhandleSave(selectedCandidateStr, scores, pairJudgeSegments, setLoading);
            } else {
                await handleSave(selectedCandidateStr, scores, segments, setLoading);
            }
        } catch (error) {
            toast.error(TOAST_MESSAGES.ERROR);
            console.error("Error saving scores:", error);
        }
    };

    // Handle locking/unlocking scores
    const handleToggleLock = (candidateId) => {
        toggleLock(candidateId, lockedCandidates, setLockedCandidates);
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
                <Head title="Scoring" />
                
                {/* Back to Dashboard Button */}
                <div className="mb-4 md:mb-6">
                    <Link 
                        href="/LeaderBoard" 
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <BsArrowLeft className="mr-2" />
                       View Leaderboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    {/* Candidate Panel */}
                    <div className="hidden lg:block lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <button
                            className="w-full text-left text-xl font-semibold mb-4 text-white"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        >
                            {isSidebarCollapsed ? "▶" : "▼"} Select A Candidates
                        </button>
                        {!isSidebarCollapsed && (
                            <ScoringCandidates
                                candidates={candidates}
                                pairCandidates={pairCandidates}
                                setIsModalOpen={setIsModalOpen}
                                selectedCandidate={selectedCandidate}
                                onSelect={handleSelectCandidate}
                            />
                        )}
                    </div>
                    {/* Draggable Button and Modal for Small Screens */}
                    {isSmallScreen && (
                        <>
                            <button
                                style={buttonStyle}
                                className="p-3 md:p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 fixed z-40"
                                onClick={() => setIsModalOpen((prev) => !prev)}
                                onMouseDown={onMouseDown}
                                onTouchStart={onTouchStart}
                                aria-label="Open candidate selection"
                            >
                                <BsPersonLinesFill className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                            </button>
                            {isModalOpen && (
                                <div {...swipeHandlers} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-lg h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Select a Contestant</h3>
                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                                            <ScoringCandidates
                                                candidates={candidates}
                                                pairCandidates={pairCandidates}
                                                setIsModalOpen={setIsModalOpen}
                                                selectedCandidate={selectedCandidate}
                                                onSelect={handleSelectCandidate}
                                            />
                                        </div>
                                        <div className="flex justify-center mt-4">
                                            <button
                                                className="px-4 py-2 bg-red-300 dark:bg-red-600 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-400 dark:hover:bg-red-500 transition duration-300"
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
                    {/* Scoring Panel */}
                    <ScoringPanel
                        selectedCandidate={selectedCandidateStr}
                        candidates={candidates}
                        pairCandidates={pairCandidates}
                        segments={segments}
                        pairJudgeSegments={pairJudgeSegments}
                        scores={scores}
                        handleScoreChange={handleScoreInputChange}
                        calculateTotalScore={calculateTotalScore}
                        calculateProgress={calculateProgress}
                        loading={loading}
                        lockedCandidates={lockedCandidates}
                        handleSave={handleSaveScores}
                        toggleLock={handleToggleLock}
                        isPairCandidate={isPairCandidate}
                        selectedGender={selectedGender}
                    />
                </div>
            </div>
            <ToastContainer />
        </>
    );
}