import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TextInput from '@/Components/TextInput';

export default function Scoring() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [segments, setSegments] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(false);
    const user = usePage().props.auth?.user;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candidatesRes, segmentsRes] = await Promise.all([
                    axios.get('/api/candidates/assigned', { withCredentials: true }),
                    axios.get('/api/judge-segments', { withCredentials: true }),
                ]);

                setCandidates(candidatesRes.data);
                setSegments(segmentsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error('Failed to load data');
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        if (!selectedCandidate) {
            toast.error('Please select a candidate first.');
            return;
        }
    
        const formattedScores = [];
    
        Object.entries(scores).forEach(([segmentId, criteriaScores]) => {
            Object.entries(criteriaScores).forEach(([criterionId, score]) => {
                formattedScores.push({
                    segment_id: segmentId,
                    criterion_id: criterionId,
                    score: score,
                });
            });
        });
    
        setLoading(true);
    
        try {
            await axios.post('/scores', {
                candidate_id: selectedCandidate,
                scores: formattedScores
            });
    
            toast.success('Scores saved successfully');
        } catch (error) {
            toast.error('Failed to save scores');
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleScoreChange = (segmentId, criterionId, value) => {
        if (value === "") {
            // Allow empty value without error
            setScores((prev) => ({
                ...prev,
                [segmentId]: {
                    ...prev[segmentId],
                    [criterionId]: "",
                },
            }));
            return;
        }
    
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
            toast.error("Score must be between 0 and 10.");
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

    const calculateTotalScore = () => {
        return Object.entries(scores).reduce((acc, [segmentId, segmentScores]) => {
            const segment = segments.find(s => s.id == segmentId);
            if (!segment) return acc;
            return acc + Object.entries(segmentScores).reduce((sum, [criterionId, score]) => {
                const criterion = segment.criteria.find(c => c.id == criterionId);
                return sum + (criterion ? (score * criterion.weight) / 10 : 0); // Correct scaling
            }, 0);
        }, 0).toFixed(2);
    };
    
    const handleCandidateSelection = async (candidateId) => {
        setSelectedCandidate(candidateId);
        setScores({}); // Reset scores initially
    
        try {
            const response = await axios.get(`/api/scores/${candidateId}`, { withCredentials: true });
            const fetchedScores = response.data;
    
            // Transform response to match the state structure and ensure score is a number
            const formattedScores = {};
            fetchedScores.forEach(({ segment_id, criterion_id, score }) => {
                const numericScore = Number(score); // Ensure it's a number
    
                if (!formattedScores[segment_id]) {
                    formattedScores[segment_id] = {};
                }
                formattedScores[segment_id][criterion_id] = Number.isInteger(numericScore) ? numericScore : parseFloat(numericScore.toFixed(2));
            });
    
            setScores(formattedScores);
        } catch (error) {
            console.error("Error fetching scores:", error);
            toast.error("Failed to load scores.");
        }
    };
    
    
    

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Scoring</h2>}>
            <Head title="Scoring" />
             <div className="flex w-full px-8 py-6 space-x-6">
           
                {/* Candidates List */}
                <div className="w-1/ bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Select a Contestant</h3>
                    {candidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            className={`cursor-pointer flex items-center space-x-4 p-3 rounded-lg hover:bg-indigo-600 hover:text-white transition ${
                                selectedCandidate === candidate.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => handleCandidateSelection(candidate.id)} 
                        >
                            <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-25 h-20 rounded-full object-cover" />
                            <span className="text-lg">{candidate.name}</span>
                        </div>
                    ))}
                </div>

                {/* Scoring Panel */}
                <div className="w-3/4 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md relative">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                        Scoring for {selectedCandidate ? candidates.find(c => c.id === selectedCandidate)?.name : 'a Candidate'}
                    </h3>

                    {selectedCandidate && (
                        <>
                            {segments.map((segment) => (
                                <div key={segment.id} className="mb-8">
                                    {/* Segment Name (e.g., Evening Gown) */}
                                    <h4 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">{segment.name}</h4>
                                    
                                    <div className="space-y-6">
                                        {segment.criteria.map((criterion) => (
                                            <div key={criterion.id} className="flex flex-col items-center">
                                                {/* Criterion Name (e.g., Design and Fitting) */}
                                                <span className="text-gray-800 dark:text-gray-200 text-l font-medium mb-2">{criterion.name}   ({`${Math.round(criterion.weight)}%`})</span>
                                                

                                                {/* Score Input (Wider and Bigger) */}
                                                <TextInput
    type="number"
    min="0"
    max="10"
    step="0.1"
    className="w-64 px-6 py-4 border-2 border-black rounded text-center text-2xl focus:ring-2 focus:ring-indigo-500 placeholder:text-sm"
    value={scores[segment.id]?.[criterion.id] || ''}
    placeholder="Enter score"
    onChange={(e) => handleScoreChange(segment.id, criterion.id, e.target.value)}
    disabled={!selectedCandidate}
/>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Bottom Section */}
                            <div className="flex justify-between items-center mt-6">
                                <span className="text-base text-gray-500">Note: Scoring is between 1-10</span>
                                <span className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
                                    Total Score: <span className="border-b-2 border-gray-700 px-4">{calculateTotalScore()}%</span>
                                </span>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button 
                                    className="px-8 py-3 border-2 border-indigo-500 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white text-lg font-bold transition-all"
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

            <ToastContainer />
        </AdminLayout>
    );
}
