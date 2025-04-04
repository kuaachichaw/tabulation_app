import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag'; // Import the updated useDrag hook
import { BiLogoSlack } from "react-icons/bi";
import UserLeaderBoard from '@/Components/UserLeaderBoard';

export default function UserLeaderboard() {
    // State management
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOverall, setIsOverall] = useState(false);
    const [error, setError] = useState(null);
    const [judges, setJudges] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100, // Adjusted initial X position
        y: 20, // Initial Y position
    });

    // Fetch judges data
    useEffect(() => {
        axios.get('/api/judges')
            .then((response) => {
                setJudges(response.data);
            })
            .catch((error) => console.error('Error fetching judges:', error));
    }, []);
    
    // Fetch segments data
    useEffect(() => {
        const fetchSegments = async () => {
            try {
                const res = await axios.get('/api/segments');
                setSegments(res.data);
                if (res.data.length > 0) {
                    setSelectedSegmentId(res.data[0].id); // Auto-select the first segment
                }
            } catch (error) {
                console.error('Failed to load segments');
                setError('Failed to load segments. Please try again later.');
            }
        };
        fetchSegments();
    }, []);

    // Fetch leaderboard data based on selection (segment or overall)
    useEffect(() => {
        if (isOverall) {
            fetchOverallLeaderboard();
        } else if (selectedSegmentId) {
            fetchSegmentLeaderboard();
        }
    }, [selectedSegmentId, isOverall]);

    // Fetch segment-specific leaderboard
    const fetchSegmentLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/leaderboard/${selectedSegmentId}`);
            setLeaderboard(res.data || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            setLeaderboard([]);
            setError('Failed to load leaderboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch overall leaderboard
    const fetchOverallLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/leaderboard/overall');
            setLeaderboard(res.data || []);
        } catch (error) {
            console.error('Failed to load overall leaderboard:', error);
            setLeaderboard([]);
            setError('Failed to load overall leaderboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

   
    

    return (
        
        <AuthenticatedLayout header={<h2 className="text-lg  font-semibold text-gray-800 dark:text-gray-200">Leaderboard</h2>}>
            <Head title="Leaderboard" />
            <FlexContainer>

        {/* Sidebar - Segments List & Overall Toggle */}
        <div className="hidden lg:block md:hidden bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <div className="sticky top-0 z-10">
    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Leaderboard Type</h3>
                    <UserLeaderBoard
                            isOverall={isOverall}
                            setIsOverall={setIsOverall}
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
                    onClick={() => setIsModalOpen((prev) => !prev)} // Toggle the modal state
                    onMouseDown={onMouseDown} // Use onMouseDown from useDrag
                    onTouchStart={onTouchStart} // Use onTouchStart from useDrag
                >
                    <BiLogoSlack className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                </button>

        {/* Modal for Selecting a Segment */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md animate-fadeIn"onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Leaderboard Type</h3>
                    <UserLeaderBoard
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
                            {isOverall ? 'Overall Leaderboard' : segments.find(segment => segment.id === selectedSegmentId)?.name || 'Leaderboard'}
                        </h3>
                        
                    </div>
        
        {/* Loading & Error Handling */}
        {loading ? (
            <div className="flex justify-center items-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full"></div>
            </div>
        ) : error ? (
            <p className="text-red-500">{error}</p>
        ) : leaderboard.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No Record for this Segment Yet..</p>
        ) : (
            <>
                {/* Top 3 Podium */}
                <div className="flex flex-col md:flex-row justify-center items-end gap-6 mt-12">
                    {leaderboard.slice(0, 3).map((candidate, index) => (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative flex flex-col items-center p-4 rounded-lg shadow-md bg-white dark:bg-gray-800"
                            style={{ minWidth: index === 0 ? "120px" : "100px" }}
                        >
                            {/* Candidate Picture & Rank Badge */}
                            <div className="relative">
    {/* Candidate Picture */}
    <img
        src={`/storage/${candidate.picture}`}
        alt={candidate.name}
        className="w-30 h-35 rounded-full object-cover border-4 border-white"
    />

    {/* Rank Badge - Centered Above the Picture with Bounce Animation */}
    <span className="badgeBounce absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm px-3 py-1 rounded-full">
        {index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}
    </span>
</div>
                            {/* Candidate Name */}
                            <h4 className="text-gray-900 dark:text-white text-lg font-bold mt-2">{candidate.name}</h4>

                               {/* Judge Scores (Only in Segment View) */}
                               {!isOverall && candidate.judge_scores && (
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                                    {candidate.judge_scores.map((judge) => (
                                        <p key={judge.judge_id}>
                                            <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{judge.judge}:</span> 
                                            <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{judge.judge_total}%</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                
                            {/* Overall and Segment TOP 3 Score */}
                            {isOverall && candidate.segments?.length > 0 ? (
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                                    {candidate.segments?.map((segment, index) => (
                                        <p key={index}>
                                            <strong>{segment.segment_name} ({segment.segment_weight}):</strong> = {segment.weighted_contribution}%
                                        </p>
                                    ))}

                                    {/* Total Score for Overall Leaderboard */}
                                    <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                        Total Score: {parseFloat(candidate.total_score.replace('%', '')).toFixed(2)}%
                                    </p>
                                </div>
                            ) : (
                                // Total Score for Segment Leaderboard
                                <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                    Total Score: {candidate.judge_score}%
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Other Contestants Section */}
                <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Other Contestants</h3>
                                <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                    {leaderboard.slice(3).map((candidate, index) => (
                                        <li key={candidate.id} className="flex flex-col p-3 border-b last:border-b-0">
                                            {/* Candidate Info */}
                                            <div className="flex flex-col md:flex-row items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">{index + 4}.</span>
                                                    <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover mr-3" />
                                                    <span className="text-gray-900 dark:text-white font-semibold">{candidate.name}</span>
                                                </div>

                                                {/* Overall Segment Weight and Score (Only in Overall View) */}
                                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                                                    {(candidate.segments || []).map((segment, index) => (
                                                        <p key={index}>
                                                            <strong>{segment.segment_name} ({segment.segment_weight}):</strong> = {segment.weighted_contribution}%
                                                        </p>
                                                    ))}
                                                </div>
                                                {/* Judge Scores (Only in Segment View) */}
                                                {!isOverall && candidate.judge_scores && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mx-4">
                                                        {candidate.judge_scores.map((judge) => (
                                                            <p key={judge.judge_id} className="text-center">
                                                                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{judge.judge}:</span>
                                                                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{judge.judge_total}%</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Overall and Segment Other Candidates */}
                                                {isOverall && candidate.segments && candidate.segments.length > 0 ? (
                                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {/* Total Score for Overall Leaderboard */}
                                                        <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                                            Total Score: {parseFloat(candidate.total_score.replace('%', '')).toFixed(2)}%
                                                        </p>
                                                    </div>
                                                ) : (
                                                    // Total Score for Segment Leaderboard
                                                    <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                                        Total Score: {candidate.judge_score}%
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </FlexContainer>
<ToastContainer />
        </AuthenticatedLayout>
    );
}