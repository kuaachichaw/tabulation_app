import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ExportCSVModal from '@/Modal/ExportCSVModal';
import OverallLeaderboardModal from '@/Modal/OverallLeaderboardModal';

export default function Leaderboard() {
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOverall, setIsOverall] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isOverallSetupOpen, setIsOverallSetupOpen] = useState(false);  // Define state for modal visibility
    const [error, setError] = useState(null); // Error handling state
    

    useEffect(() => {
        const fetchSegments = async () => {
            try {
                const res = await axios.get('/api/segments');
                setSegments(res.data);
                if (res.data.length > 0) {
                    setSelectedSegmentId(res.data[0].id);
                }
            } catch (error) {
                console.error('Failed to load segments');
                setError('Failed to load segments. Please try again later.');
            }
        };
        fetchSegments();
    }, []);

    useEffect(() => {
        if (isOverall) {
            fetchOverallLeaderboard();
        } else if (selectedSegmentId) {
            fetchSegmentLeaderboard();
        }
    }, [selectedSegmentId, isOverall]);

    const fetchSegmentLeaderboard = async () => {
        setLoading(true);
        setError(null); // Reset error when fetching new data
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

    const fetchOverallLeaderboard = async () => {
        setLoading(true);
        setError(null); // Reset error when fetching new data
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
        <AdminLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Leaderboard</h2>}>
            <Head title="Leaderboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Segments List & Overall Toggle */}
                    <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Leaderboard Type</h3>
                        <button
                            className={`w-full text-left p-3 rounded-lg transition mb-2 ${isOverall ? 'bg-indigo-700 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'}`}
                            onClick={() => setIsOverall(true)}
                        >
                            Overall Leaderboard
                        </button>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 mt-4">Select a Segment</h3>
                        <div className="space-y-4">
                            {segments.map((segment) => (
                                <button
                                    key={segment.id}
                                    className={`w-full text-left p-3 rounded-lg transition ${!isOverall && selectedSegmentId === segment.id ? 'bg-indigo-700 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'}`}
                                    onClick={() => { setSelectedSegmentId(segment.id); setIsOverall(false); }}
                                >
                                    {segment.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Leaderboard Display */}
                    <div className="col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{isOverall ? 'Overall Leaderboard' : 'Leaderboard'}</h3>
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

                        {loading ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full"></div>
                            </div>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : leaderboard.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No leaderboard data available. Please try again later.</p>
                        ) : (
                            <>
                                {/* Top 3 Podium */}
                                <div className="flex justify-center items-end gap-6 mt-6">
                                    {leaderboard.slice(0, 3).map((candidate, index) => (
                                        <motion.div
                                            key={candidate.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="relative flex flex-col items-center p-4 rounded-lg shadow-md bg-white dark:bg-gray-800"
                                            style={{ minWidth: index === 0 ? "120px" : "100px" }}
                                        >
                                            <img
                                                src={`/storage/${candidate.picture}`}
                                                alt={candidate.name}
                                                className="w-30 h-35 rounded-full object-cover border-4 border-white"
                                            />
                                            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-full">
                                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                            </span>
                                            <h4 className="text-gray-900 dark:text-white text-lg font-bold">{candidate.name}</h4>
                                            <p className="text-gray-700 dark:text-gray-300 font-semibold">{isOverall ? `${candidate.total_score}%` : `${candidate.score}%`}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Remaining Candidates */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Other Contestants</h3>
                                    <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                                        {leaderboard.slice(3).map((candidate, index) => (
                                            <li key={candidate.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                                <div className="flex items-center">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">{index + 4}.</span>
                                                    <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                                                    <span className="text-gray-900 dark:text-white font-semibold">{candidate.name}</span>
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 font-semibold">{isOverall ? `${candidate.total_score}%` : `${candidate.score}%`}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ExportCSVModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                leaderboard={leaderboard}
                segments={segments}
                selectedSegmentId={selectedSegmentId}
                isOverall={isOverall}
            />

            <OverallLeaderboardModal
                isOpen={isOverallSetupOpen}
                closeModal={() => setIsOverallSetupOpen(false)}
                segments={segments}
            />
        </AdminLayout>
    );
}
