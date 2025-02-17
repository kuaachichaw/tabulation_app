import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ScoringModal({ isOpen, onClose }) {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [segments, setSegments] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [candidatesRes, segmentsRes] = await Promise.all([
                        axios.get('/api/candidates'),
                        axios.get('/api/segments'),
                    ]);
                    setCandidates(candidatesRes.data);
                    setSegments(segmentsRes.data);
                } catch (error) {
                    toast.error('Failed to load data');
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleScoreChange = (segmentId, criterionId, value) => {
        if (value < 0 || value > 10) return;
        setScores((prev) => ({
            ...prev,
            [segmentId]: {
                ...prev[segmentId],
                [criterionId]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!selectedCandidate) {
            toast.error('Please select a candidate first.');
            return;
        }
        try {
            setLoading(true);
            await axios.post('/api/scores', { candidate_id: selectedCandidate, scores });
            toast.success('Scores saved successfully');
            onClose(); // Close modal after saving
        } catch (error) {
            toast.error('Failed to save scores');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-6xl h-5/6 overflow-y-auto">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                            Scoring for {selectedCandidate ? candidates.find(c => c.id === selectedCandidate)?.name : 'a Candidate'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="grid grid-cols-3 gap-6 w-full">
                        
                        {/* Candidates List */}
                        <div className="col-span-1 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md w-full">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Select a Candidate</h3>
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className={`cursor-pointer flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-500 hover:text-white transition ${
                                        selectedCandidate === candidate.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-300'
                                    }`}
                                    onClick={() => setSelectedCandidate(candidate.id)}
                                >
                                    <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-16 h-16 rounded-full object-cover" />
                                    <span className="text-lg">{candidate.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Scoring Panel */}
                        <div className="col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full">
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Scoring Criteria</h3>

                            {/* Score Inputs */}
                            {segments.map((segment) => (
                                <div key={segment.id} className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-2">{segment.name}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {segment.criteria.map((criterion) => (
                                            <div key={criterion.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                                <span className="text-gray-800 dark:text-gray-200">{criterion.name}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                                    value={scores[segment.id]?.[criterion.id] || ''}
                                                    onChange={(e) => handleScoreChange(segment.id, criterion.id, parseFloat(e.target.value))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Save Button */}
                            <button 
                                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Scores'}
                            </button>
                        </div>
                    </div>

                    {/* Close Modal Button */}
                    <div className="mt-4 text-right">
                        <button 
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </>
    );
}
