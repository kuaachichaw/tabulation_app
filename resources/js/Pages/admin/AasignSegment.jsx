import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AassignSegment() {
    const [judges, setJudges] = useState([]);
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [judgesRes, segmentsRes] = await Promise.all([
                    axios.get('/api/judges'),
                    axios.get('/api/segments'),
                ]);
                setJudges(judgesRes.data);
                setSegments(segmentsRes.data);
            } catch (error) {
                toast.error('Failed to load data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedSegmentId || judges.length === 0) return;

        const fetchAssignments = async () => {
            try {
                const res = await axios.get(`/api/judge-segment/${selectedSegmentId}`);
                const assigned = res.data.reduce((acc, judgeId) => {
                    acc[judgeId] = true;
                    return acc;
                }, {});
                setAssignments(assigned);
                setSelectAll(judges.every(judge => assigned[judge.id]));
            } catch (error) {
                toast.error('Failed to load assignments');
            }
        };

        fetchAssignments();
    }, [selectedSegmentId, judges]);

    const handleToggle = (judgeId) => {
        setAssignments(prev => {
            const updated = { ...prev, [judgeId]: !prev[judgeId] };
            setSelectAll(judges.every(judge => updated[judge.id]));
            return updated;
        });
    };

    const handleSelectAll = () => {
        const newState = !selectAll;
        setSelectAll(newState);
        const updatedAssignments = {};
        judges.forEach(judge => {
            updatedAssignments[judge.id] = newState;
        });
        setAssignments(updatedAssignments);
    };

    const handleSave = async () => {
        if (!selectedSegmentId || Object.keys(assignments).length === 0) {
            toast.error('Please select a segment and make changes first.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/judge-segment', { segment_id: selectedSegmentId, assignments });
            toast.success('Assignments saved successfully');
        } catch (error) {
            toast.error('Failed to save assignments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Assign Segment to Judges</h2>}>
            <Head title="Assign Segment" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Select a Segment</h3>
                        <div className="space-y-4">
                            {segments.map(segment => (
                                <div key={segment.id} 
                                    className={`cursor-pointer flex items-center space-x-4 p-4 rounded-lg transition duration-200 ${selectedSegmentId === segment.id ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'}`} 
                                    onClick={() => setSelectedSegmentId(segment.id)}>
                                    <span className="text-lg font-medium">{segment.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Select All</span>
                            <label className="relative inline-flex items-center cursor-pointer" onClick={handleSelectAll}>
                                <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${selectAll === null ? 'bg-gray-400' : selectAll ? 'bg-green-600' : 'bg-red-600'}`}>
                                    <div className={`absolute top-[2px] left-[2px] w-6 h-6 bg-white rounded-full shadow-md transition-transform ${selectAll ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
                            Assign {selectedSegmentId ? segments.find(s => s.id === selectedSegmentId)?.name : 'a Segment'} to Judges
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {judges.map(judge => (
                                <div key={judge.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col items-center">
                                    <img src={`/storage/${judge.picture}`} alt={judge.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{judge.name}</h4>
                                    <label className="mt-4 cursor-pointer" onClick={() => handleToggle(judge.id)}>
                                        <div className={`relative w-14 h-7 flex items-center rounded-full transition-colors ${assignments[judge.id] ? 'bg-green-600' : 'bg-red-600'}`}>
                                            <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${assignments[judge.id] ? 'translate-x-7' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8">
                            <button className={`px-6 py-3 text-white rounded-lg transition duration-300 ${selectedSegmentId && Object.keys(assignments).length > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`} 
                                onClick={handleSave} disabled={!selectedSegmentId || loading}>
                                {loading ? 'Saving...' : 'Save Assignments'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </AdminLayout>
    );
}
