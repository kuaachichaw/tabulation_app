import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag';
import SegmentSelector from '@/Components/SegmentSelector';
import { BiLogoSlack } from "react-icons/bi";

export default function AassignSegment() {
    const [judges, setJudges] = useState([]);
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100, // Adjusted initial X position
        y: 20, // Initial Y position
    });

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
        <AdminLayout header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Assign Segment to Judges</h2>}>
            <Head title="Assign Segment" />
            <FlexContainer>
                <div className="hidden lg:block md:hidden bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="sticky top-0 z-10">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Select a Segment</h3>
                        
                        <SegmentSelector
                            segments={segments}
                            setIsModalOpen={setIsModalOpen}
                            selectedSegmentId={selectedSegmentId}
                            onSelectSegment={setSelectedSegmentId}
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
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Select a Segment</h3>

                                    <SegmentSelector
                                        segments={segments}
                                        setIsModalOpen={setIsModalOpen}
                                        selectedSegmentId={selectedSegmentId}
                                        onSelectSegment={setSelectedSegmentId}
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
                <div className="col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Select All</span>
                        <label className="relative inline-flex items-center cursor-pointer" onClick={handleSelectAll}>
                            <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${selectAll === null ? 'bg-gray-400' : selectAll ? 'bg-green-600' : 'bg-red-600'}`}>
                                <div className={`absolute top-[2px] left-[2px] w-6 h-6 bg-white rounded-full shadow-md transition-transform ${selectAll ? 'translate-x-7' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
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
            </FlexContainer>

            <ToastContainer />
        </AdminLayout>
    );
}