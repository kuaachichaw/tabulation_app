import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ExportCSVModal from '@/Modal/ExportCSVModal';
import OverallLeaderboardModal from '@/Modal/OverallLeaderboardModal';
import FlexContainer from '@/Components/FlexContainer';

export default function Leaderboard() {
    // State management
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOverall, setIsOverall] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isOverallSetupOpen, setIsOverallSetupOpen] = useState(false);
    const [error, setError] = useState(null);
    const [judges, setJudges] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const FlexContainer = ({ children }) => {
        return (
            <div className="flex flex-col md:flex-row gap-4 p-4">
                {children}
            </div>
        );
    };

      // Close sidebar when clicking outside
      useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSidebarOpen && !event.target.closest('.sidebar')) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);
    
    // console.log("Data passed to ExportCSVModal:", {
    //     leaderboard,
    //     segments,
    //     selectedSegmentId,
    //     isOverall,
    //     judges,
    // });

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Leaderboard</h2>}>
            <Head title="Leaderboard" />
            <FlexContainer>

                 {/* Hamburger Button (Visible only on small screens) */}
                 
                 <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="md:hidden p-2 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"
                >
                    ☰ {/* Hamburger icon */}
                </button>
                
            <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar - Segments List & Overall Toggle */}
        <div className={`sidebar ${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md`}>
                    <div className="sticky top-0 z-10">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Leaderboard Type</h3>

              <button
                            className={`w-full text-left p-3 rounded-lg transition mb-2 ${isOverall ? 'bg-indigo-700 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'}`}
                            onClick={() => {
                                setIsOverall(true);
                                setIsSidebarOpen(false); // Close sidebar on selection
                            }}
                        >
                            Overall Leaderboard
                        </button>
            
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 mt-4">Select a Segment</h3>
                        <div className="space-y-4">
                            {segments.map((segment) => (
                                <button
                                    key={segment.id}
                                    className={`w-full text-left p-3 rounded-lg transition ${!isOverall && selectedSegmentId === segment.id ? 'bg-indigo-700 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'}`}
                                    onClick={() => {
                                        setSelectedSegmentId(segment.id);
                                        setIsOverall(false);
                                        setIsSidebarOpen(false); // Close sidebar on selection
                                    }}
                                >
                                    {segment.name}
                    </button>
                ))}
            </div>
        </div>
    </div>
    
    {/* Main Content - Leaderboard Display */}
    <div className="w-full md:w-3/4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
    {isOverall ? 'Overall Leaderboard' : segments.find(segment => segment.id === selectedSegmentId)?.name || 'Leaderboard'}
</h3>

            <div className="flex gap-3">
                {isOverall && (
                    <button 
                        onClick={() => setIsOverallSetupOpen(true)} 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Overall Setup
                    </button>
                )}
                <button 
                    onClick={() => setIsExportModalOpen(true)} 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
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
                {/* Top 3 Podium */}
                <div className="flex flex-col md:flex-row justify-center items-end gap-6 mt-6">
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
                            <img
                                src={`/storage/${candidate.picture}`}
                                alt={candidate.name}
                                className="w-30 h-35 rounded-full object-cover border-4 border-white"
                            />
                            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-full">
                                {index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}
                            </span>
                            
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
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Other Contestants</h3>
                    <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        {leaderboard.slice(3).map((candidate, index) => (
                            <li key={candidate.id} className="flex flex-col p-3 border-b last:border-b-0">
                                {/* Candidate Info */}
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">{index + 4}.</span>
                                        <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-14 h-15 rounded-full object-cover mr-3" />
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
</div>
                         
            </FlexContainer>
            <ExportCSVModal
    isOpen={isExportModalOpen}
    onClose={() => setIsExportModalOpen(false)}
    leaderboard={leaderboard}  // Leaderboard data (array of candidates)
    segments={segments}  // List of all segments
    selectedSegmentId={selectedSegmentId}  // Currently selected segment ID
    isOverall={isOverall}  // Boolean: whether the user is viewing the Overall Leaderboard
    judges={judges}  // NEW: List of all judges
/>
            <OverallLeaderboardModal
                isOpen={isOverallSetupOpen}
                closeModal={() => setIsOverallSetupOpen(false)}
                segments={segments}
            />
        </AdminLayout>
    );
}
