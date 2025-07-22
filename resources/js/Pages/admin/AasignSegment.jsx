import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag';
import SegmentSelector from '@/Components/SegmentSelector';
import { BiLogoSlack, BiSave } from "react-icons/bi";
import { BiUserX } from "react-icons/bi";

const AnimatedToggle = ({ isOn, onClick, color = 'green' }) => {
  const colorClasses = {
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div 
      onClick={onClick}
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        isOn ? colorClasses[color] : 'bg-gray-400'
      }`}
    >
      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
        isOn ? 'translate-x-7' : ''
      }`}/>
    </div>
  );
};

export default function AssignSegment() {
    const [judges, setJudges] = useState([]);
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [judgesRes, soloSegmentsRes, pairSegmentsRes] = await Promise.all([
                    axios.get('/api/judges'),
                    axios.get('/api/segments'),
                    axios.get('/api/pair-segments'),
                ]);
                setJudges(judgesRes.data);

                const combinedSegments = [
                    ...soloSegmentsRes.data.map(segment => ({ ...segment, type: 'solo' })),
                    ...pairSegmentsRes.data.map(segment => ({ ...segment, type: 'pair' })),
                ];
                setSegments(combinedSegments);
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
                const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);
                const endpoint = selectedSegment.type === 'solo' ? '/api/judge-segment' : '/api/pair-judge-segments';
    
                const res = await axios.get(`${endpoint}/${selectedSegmentId}`);
    
                let assigned = {};
                if (selectedSegment.type === 'solo') {
                    assigned = res.data.reduce((acc, judgeId) => {
                        acc[judgeId] = true;
                        return acc;
                    }, {});
                } else {
                    assigned = res.data.reduce((acc, assignment) => {
                        acc[assignment.judge.id] = true;
                        return acc;
                    }, {});
                }
    
                setAssignments(assigned);
                setSelectAll(judges.every(judge => assigned[judge.id]));
            } catch (error) {
                toast.error('Failed to load assignments');
            }
        };
    
        fetchAssignments();
    }, [selectedSegmentId, judges, segments]);

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
            const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);
            const endpoint = selectedSegment.type === 'solo' ? '/api/judge-segment' : '/api/pair-judge-segments';
    
            const payload = selectedSegment.type === 'solo'
                ? { segment_id: selectedSegmentId, assignments }
                : { pair_segment_id: selectedSegmentId, assignments };
    
            await axios.post(endpoint, payload);
            toast.success('Assignments saved successfully');
        } catch (error) {
            if (error.response) {
                console.error('Validation errors:', error.response.data.errors);
            }
            toast.error('Failed to save assignments');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);
    const segmentName = selectedSegment 
        ? (selectedSegment.pair_name || selectedSegment.name)
        : 'a Segment';

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
                        <button
                            style={buttonStyle}
                            className="p-3 md:p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
                            onClick={() => setIsModalOpen((prev) => !prev)}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            <BiLogoSlack className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                        </button>

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
                    {selectedSegment && (
                        <div className="mb-6 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center">
                            <span className="font-bold">Selected Segment: </span>
                            <span className="ml-2 text-indigo-700 dark:text-indigo-200">
                                {segmentName}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-8 right-10">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Select All</span>
                            <label className="relative inline-flex items-center cursor-pointer" onClick={handleSelectAll}>
                                <AnimatedToggle isOn={selectAll} onClick={handleSelectAll} />
                            </label>
                        </div>
                    </div>

                    {judges.length === 0 && !loading && (
                        <div className="col-span-3 text-center py-12">
                            <BiUserX className="mx-auto text-5xl text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                                No judges available
                            </h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                Please add judges first before assigning segments
                            </p>
                        </div>
                    )}

                    {judges.length === 0 && loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"></div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {judges.map(judge => (
                            <div 
                                key={judge.id} 
                                className={`
                                    relative bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 
                                    transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                                    border-l-4 ${assignments[judge.id] ? 'border-green-500' : 'border-transparent'}
                                `}
                            >
                                {assignments[judge.id] && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                        Assigned
                                    </div>
                                )}
                                <img 
                                    src={`/storage/${judge.picture}`} 
                                    alt={judge.name} 
                                    className="w-24 h-24 rounded-full object-cover mb-4 mx-auto"
                                />
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                                    {judge.name}
                                </h4>
                                <div className="mt-4 flex justify-center">
                                    <AnimatedToggle 
                                        isOn={assignments[judge.id]} 
                                        onClick={() => handleToggle(judge.id)} 
                                        color="green"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {judges.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button 
                                onClick={() => setShowConfirm(true)}
                                disabled={!selectedSegmentId || loading}
                                className={`
                                    px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center
                                    ${selectedSegmentId 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                    }
                                    ${loading && 'opacity-75'}
                                `}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <BiSave className="mr-2" />
                                )}
                                Save Assignments
                            </button>
                        </div>
                    )}
                </div>
            </FlexContainer>

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md">
                        <h3 className="text-lg font-medium mb-4 dark:text-white">Confirm Assignments</h3>
                        <p className="dark:text-gray-300">
                            Are you sure you want to assign {segmentName} to the selected judges?
                        </p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 border rounded-lg dark:text-gray-300 dark:border-gray-600"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={3000} />
        </AdminLayout>
    );
}