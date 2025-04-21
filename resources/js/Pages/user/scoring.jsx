import { useState, useEffect, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TextInput from '@/Components/TextInput';
import { BsPersonLinesFill } from "react-icons/bs";
import useDrag from '@/Components/useDrag';
import ScoringSelector from '@/Components/ScoringSelector';
import FlexContainer from '@/Components/FlexContainer';

export default function Scoring() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [segments, setSegments] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(false);
    const user = usePage().props.auth?.user;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100, // Adjusted initial X position
        y: 20, // Initial Y position
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candidatesRes, segmentsRes] = await Promise.all([
                    axios.get('/api/candidates/assigned', { withCredentials: true }),
                    axios.get('/api/judge-segments', { withCredentials: true }),
                ]);

                if (!candidatesRes.data || !segmentsRes.data) {
                    toast.error('Invalid data received from the server.');
                    return;
                }

                setCandidates(candidatesRes.data);
                setSegments(segmentsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error('Failed to load data');
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        if (!selectedCandidate) {
            toast.error('Please select a candidate first.');
            return;
        }

        // Validate all scores are filled
        const allScoresFilled = segments.every(segment =>
            segment.criteria.every(criterion =>
                scores[segment.id]?.[criterion.id] !== null && scores[segment.id]?.[criterion.id] !== undefined
            )
        );

        if (!allScoresFilled) {
            toast.error('Please fill in all scores before saving.');
            return;
        }

        const formattedScores = [];

        Object.entries(scores).forEach(([segmentId, criteriaScores]) => {
            Object.entries(criteriaScores).forEach(([criterionId, score]) => {
                const segment = segments.find(s => s.id == segmentId);
                const criterion = segment?.criteria.find(c => c.id == criterionId);

                if (criterion) {
                    const weightedScore = ((score || 0) * (criterion.weight || 0)) / 10; // Apply weight
                    formattedScores.push({
                        segment_id: segmentId,
                        criterion_id: criterionId,
                        score: weightedScore,
                    });
                }
            });
        });

        setLoading(true);

        try {
            await toast.promise(
                axios.post('/scores', {
                    candidate_id: selectedCandidate,
                    scores: formattedScores,
                }),
                {
                    pending: 'Saving scores...',
                    success: 'Scores saved successfully!',
                    error: 'Failed to save scores.',
                }
            );
        } catch (error) {
            console.error('Error saving scores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (segmentId, criterionId, value) => {
        if (value === "") {
            setScores((prev) => ({
                ...prev,
                [segmentId]: {
                    ...prev[segmentId],
                    [criterionId]: null,
                },
            }));
            return;
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
            toast.error("Score must be between 1 and 10.");
            return;
        }

        setScores((prev) => ({
            ...prev,
            [segmentId]: {
                ...prev[segmentId],
                [criterionId]: numericValue,
            },
        }));
    };

    const calculateTotalScore = useMemo(() => {
        if (!segments.length) return 0;
        return Object.entries(scores).reduce((acc, [segmentId, segmentScores]) => {
            const segment = segments.find(s => s.id == segmentId);
            if (!segment) return acc;

            return acc + Object.entries(segmentScores).reduce((sum, [criterionId, score]) => {
                const criterion = segment.criteria.find(c => c.id == criterionId);
                return sum + (criterion ? ((score || 0) * criterion.weight) / 10 : 0);
            }, 0);
        }, 0).toFixed(2);
    }, [scores, segments]);

    const handleCandidateSelection = async (candidateId) => {
        setSelectedCandidate(candidateId);
        setScores({});

        try {
            const response = await axios.get(`/api/scores/${candidateId}`, { withCredentials: true });
            const fetchedScores = response.data;

            const formattedScores = {};
            fetchedScores.forEach(({ segment_id, criterion_id, score }) => {
                const segment = segments.find(s => s.id == segment_id);
                const criterion = segment?.criteria.find(c => c.id == criterion_id);

                if (criterion) {
                    const originalScore = criterion.weight > 0 ? (score * 10) / criterion.weight : 0;
                    if (!formattedScores[segment_id]) {
                        formattedScores[segment_id] = {};
                    }
                    formattedScores[segment_id][criterion_id] = Number(originalScore.toFixed(2)) || 0;
                }
            });

            setScores(formattedScores);
        } catch (error) {
            console.error("Error fetching scores:", error);
            toast.error("Failed to load scores.");
        }
    };

    const handleScoreBlur = () => {
        const allScoresFilled = Object.values(scores).every(segmentScores =>
            Object.values(segmentScores).every(score => score !== null && score !== undefined)
        );

        if (!allScoresFilled) {
            toast.error("Please fill in all the scores before saving.");
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
                <Head title="Scoring" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    {/* Candidate Panel */}
<div className="hidden lg:block lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Select a Contestant</h3>
    <ScoringSelector
        candidates={candidates}
        setIsModalOpen={setIsModalOpen}
        selectedCandidate={selectedCandidate}
        onSelect={handleCandidateSelection}
    />
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
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-lg h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Select a Contestant</h3>
                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                                            <ScoringSelector
                                                candidates={candidates}
                                                setIsModalOpen={setIsModalOpen}
                                                selectedCandidate={selectedCandidate}
                                                onSelect={handleCandidateSelection}
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
                    <div className="lg:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl relative">
                        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pb-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
                                {selectedCandidate ? (
                                    <>
                                        Scoring for <br />
                                        <span className="text-indigo-600 dark:text-indigo-400">
                                            {candidates.find(c => c.id === selectedCandidate)?.name}
                                        </span>
                                    </>
                                ) : (
                                    "Select a Candidate First"
                                )}
                            </h3>

                            {selectedCandidate && (
                                <>
                                    {segments.map((segment) => (
                                        <div key={segment.id} className="mb-8">
                                            <h4 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center uppercase">
                                                {segment.name}
                                            </h4>
                                            <div className="space-y-2">
                                                {segment.criteria.map((criterion) => (
                                                    <div key={criterion.id} className="flex flex-col items-center">
                                                        <span className="text-gray-800 dark:text-gray-200 text-lg font-medium mb-3">
                                                            {criterion.name} ({`${Math.round(criterion.weight)}%`})
                                                        </span>
                                                        <TextInput
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            step="0.1"
                                                            className="transition-transform focus:scale-105 w-full md:w-64 px-4 py-3 md:px-6 md:py-4 border-2 border-indigo-500 rounded text-center text-2xl md:text-3xl focus:ring-2 focus:ring-indigo-500 placeholder:text-sm"
                                                            value={scores[segment.id]?.[criterion.id] || ''}
                                                            placeholder="Enter score"
                                                            onChange={(e) => handleScoreChange(segment.id, criterion.id, e.target.value)}
                                                            onBlur={handleScoreBlur}
                                                            disabled={!selectedCandidate}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex flex-col items-center mt-6 space-y-4">
                                        <span className="text-base text-gray-500">Note: Scoring is between 1-10</span>
                                        <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                                            <span className="text-lg text-white-500">Total Score: </span>
                                            <span className="border-b-2 border-gray-700 px-4">{calculateTotalScore}%</span>
                                        </span>

                                        <button
                                            className="w-48 px-8 py-3 border-2 border-indigo-500 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white text-lg font-bold transition-all mt-6"
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}