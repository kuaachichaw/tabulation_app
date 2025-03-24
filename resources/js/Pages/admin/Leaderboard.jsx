import { useState, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExportCSVModal from '@/Modal/ExportCSVModal';
import OverallLeaderboardModal from '@/Modal/OverallLeaderboardModal';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag';
import { BiLogoSlack, BiPrinter } from "react-icons/bi";
import LeaderboardTypeSelector from '@/Components/LeaderboardTypeSelector';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Refs
    const printableRef = useRef();
    
    // Drag functionality for mobile
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    // Get selected segment
    const selectedSegment = useMemo(() => 
        segments.find(segment => segment.id === selectedSegmentId),
        [segments, selectedSegmentId]
    );

    // Print handler
    const handlePrint = useReactToPrint({
        content: () => printableRef.current,
        pageStyle: `
            @page { size: A4 landscape; margin: 1cm; }
            @media print {
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                .break-after { page-break-after: always; }
                body { font-size: 12pt; color: #000; background: none; }
            }
        `,
        documentTitle: isOverall ? 'Overall Leaderboard' : `${selectedSegment?.name} Leaderboard`,
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
                    setSelectedSegmentId(res.data[0].id);
                }
            } catch (error) {
                console.error('Failed to load segments');
                setError('Failed to load segments. Please try again later.');
            }
        };
        fetchSegments();
    }, []);

    // Fetch leaderboard data based on selection
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
        <AdminLayout header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Leaderboard</h2>}>
            <Head title="Leaderboard" />
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

                {/* Mobile draggable button */}
                {isSmallScreen && (
                    <>
                        <button
                            style={buttonStyle}
                            className="p-3 md:p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 no-print"
                            onClick={() => setIsModalOpen((prev) => !prev)}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            <BiLogoSlack className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                        </button>

                        {/* Modal for Selecting a Segment */}
                        {isModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print" onClick={() => setIsModalOpen(false)}>
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
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 no-print">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">
                            {isOverall ? 'Overall Leaderboard' : selectedSegment?.name || 'Leaderboard'}
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
                            <button
                                onClick={handlePrint}
                                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 md:py-2 px-3 md:px-4 rounded-lg text-sm md:text-base flex items-center gap-1"
                            >
                                <BiPrinter className="text-lg" /> Print
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
                        <p className="text-gray-500 dark:text-gray-400">Judges did not Score this Segment Yet.</p>
                    ) : (
                        <>
                            {/* Printable Content */}
                            <div className="hidden">
                                <div ref={printableRef} className="p-6 print:block">
                                    <div className="print-header">
                                        <h1 className="print-title text-2xl font-bold mb-2">
                                            {isOverall ? 'Overall Competition Results' : `${selectedSegment?.name} Results`}
                                        </h1>
                                        <div className="print-meta flex justify-between text-sm text-gray-600 mb-4">
                                            <p>Printed on: {new Date().toLocaleDateString()}</p>
                                            <p>Page 1 of 1</p>
                                        </div>
                                    </div>

                                    {/* Top 3 Podium - Print Version */}
                                    <div className="print-podium flex justify-center gap-6 mb-8 print:gap-4">
                                        {leaderboard.slice(0, 3).map((candidate, index) => (
                                            <div key={candidate.id} className={`flex flex-col items-center ${index === 1 ? 'order-first' : ''}`}>
                                                <div className="print-rank text-xl font-bold mb-2">
                                                    {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'}
                                                </div>
                                                <img
                                                    src={`/storage/${candidate.picture}`}
                                                    alt={candidate.name}
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 mb-2"
                                                />
                                                <h3 className="text-lg font-bold">{candidate.name}</h3>
                                                <p className="text-lg font-semibold">
                                                    {isOverall 
                                                        ? `${parseFloat(candidate.total_score.replace('%', '')).toFixed(2)}%` 
                                                        : `${candidate.judge_score}%`
                                                    }
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Contestant table for printing */}
                                    <table className="w-full border-collapse mt-6">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 border text-left">Rank</th>
                                                <th className="p-2 border text-left">Candidate</th>
                                                {!isOverall && judges.map(judge => (
                                                    <th key={judge.id} className="p-2 border text-left">{judge.name}</th>
                                                ))}
                                                <th className="p-2 border text-left">Total Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.slice(3).map((candidate, index) => (
                                                <tr key={candidate.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                    <td className="p-2 border">{index + 4}</td>
                                                    <td className="p-2 border flex items-center">
                                                        <img
                                                            src={`/storage/${candidate.picture}`}
                                                            alt=""
                                                            className="w-10 h-10 rounded-full object-cover mr-2"
                                                        />
                                                        {candidate.name}
                                                    </td>
                                                    {!isOverall && judges.map(judge => {
                                                        const judgeScore = candidate.judge_scores?.find(js => js.judge_id === judge.id);
                                                        return (
                                                            <td key={judge.id} className="p-2 border">
                                                                {judgeScore?.judge_total || '-'}%
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-2 border font-bold">
                                                        {isOverall 
                                                            ? `${parseFloat(candidate.total_score.replace('%', '')).toFixed(2)}%`
                                                            : `${candidate.judge_score}%`
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Screen Display */}
                            <div className="no-print">
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
                                            <div className="relative">
                                                <img
                                                    src={`/storage/${candidate.picture}`}
                                                    alt={candidate.name}
                                                    className="w-30 h-35 rounded-full object-cover border-4 border-white"
                                                />
                                                <span className="badgeBounce absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg px-8 py-3 rounded-full">
                                                    {index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}
                                                </span>
                                            </div>
                                            <h4 className="text-gray-900 dark:text-white text-lg font-bold mt-2">{candidate.name}</h4>
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
                                            {isOverall && candidate.segments?.length > 0 ? (
                                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                                                    {candidate.segments?.map((segment, index) => (
                                                        <p key={index}>
                                                            <strong>{segment.segment_name} ({segment.segment_weight}):</strong> = {segment.weighted_contribution}%
                                                        </p>
                                                    ))}
                                                    <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                                        Total Score: {parseFloat(candidate.total_score.replace('%', '')).toFixed(2)}%
                                                    </p>
                                                </div>
                                            ) : (
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
                                                <div className="flex flex-col md:flex-row items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white mr-4">{index + 4}.</span>
                                                        <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover mr-3" />
                                                        <span className="text-gray-900 dark:text-white font-semibold">{candidate.name}</span>
                                                    </div>
                                                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                                                        {(candidate.segments || []).map((segment, index) => (
                                                            <p key={index}>
                                                                <strong>{segment.segment_name} ({segment.segment_weight}):</strong> = {segment.weighted_contribution}%
                                                            </p>
                                                        ))}
                                                    </div>
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
                                                    {isOverall && candidate.segments && candidate.segments.length > 0 ? (
                                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                                                Total Score: {parseFloat(candidate.total_score.replace('%', '')).toFixed(2)}%
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 font-bold text-lg text-gray-900 dark:text-white">
                                                            Total Score: {candidate.judge_score}%
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
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