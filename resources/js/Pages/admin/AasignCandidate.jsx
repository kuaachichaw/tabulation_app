import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FlexContainer from '@/Components/FlexContainer';
import useDrag from '@/Components/useDrag';
import CandidateSelector from '@/Components/CandidateSelector';
import { BiLogoSlack } from "react-icons/bi";
import { BiSolidUser } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";

export default function AassignCandidate() {
    const [judges, setJudges] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [pairCandidates, setPairCandidates] = useState([]);
    const [selectedJudge, setSelectedJudge] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState('solo'); // 'solo' or 'pair'
    const { buttonStyle, onMouseDown, onTouchStart, isSmallScreen } = useDrag({
        x: window.innerWidth - 100,
        y: 20,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [judgesRes, candidatesRes, pairCandidatesRes] = await Promise.all([
                    axios.get('/api/judges'),
                    axios.get('/api/candidates'),
                    axios.get('/api/pair-candidates'),
                ]);
                setJudges(judgesRes.data);
                setCandidates(candidatesRes.data);
                setPairCandidates(pairCandidatesRes.data);
            } catch (error) {
                toast.error('Failed to load data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedJudge) return;

        const fetchAssignments = async () => {
            try {
                const endpoint = displayMode === 'solo' ? `/api/assignments/${selectedJudge}` : `/api/pair-assignments/${selectedJudge}`;
                const res = await axios.get(endpoint);
                const assigned = res.data.reduce((acc, id) => ({ ...acc, [id]: true }), {});
                setAssignments(assigned);
                const allAssigned = displayMode === 'solo'
                    ? candidates.every(candidate => assigned[candidate.id])
                    : pairCandidates.every(pair => assigned[pair.id]);
                setSelectAll(allAssigned ? true : false);
            } catch (error) {
                toast.error('Failed to load assignments');
            }
        };
        fetchAssignments();
    }, [selectedJudge, candidates, pairCandidates, displayMode]);

    const handleToggle = (id) => {
        setAssignments((prev) => {
            const updatedAssignments = { ...prev, [id]: !prev[id] };
            const allAssigned = displayMode === 'solo'
                ? candidates.every(candidate => updatedAssignments[candidate.id])
                : pairCandidates.every(pair => updatedAssignments[pair.id]);
            setSelectAll(allAssigned ? true : false);
            return updatedAssignments;
        });
    };

    const handleSelectAll = () => {
        const newState = selectAll ? false : true;
        setSelectAll(newState);
        const updatedAssignments = {};
        const items = displayMode === 'solo' ? candidates : pairCandidates;
        items.forEach(item => {
            updatedAssignments[item.id] = newState;
        });
        setAssignments(updatedAssignments);
    };

    const handleSave = async () => {
        if (!selectedJudge) {
            toast.error('Please select a judge first.');
            return;
        }
        try {
            const endpoint = displayMode === 'solo' ? '/api/assignments' : '/api/pair-assignments';
            await axios.post(endpoint, { judge_id: selectedJudge, assignments });
            toast.success('Assignments saved successfully');
        } catch (error) {
            toast.error('Failed to save assignments');
        }
    };

    return (
        <AdminLayout header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Assign Judge to Candidates</h2>}>
            <Head title="Assign Candidate" />
            <FlexContainer>
                <div className="hidden lg:block md:hidden bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="sticky top-0 z-10">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Select a Judge</h3>
                        <CandidateSelector
                            judges={judges}
                            setIsModalOpen={setIsModalOpen}
                            selectedJudge={selectedJudge}
                            onSelectJudge={setSelectedJudge}
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
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Select a Judge</h3>
                                    <CandidateSelector
                                        judges={judges}
                                        setIsModalOpen={setIsModalOpen}
                                        selectedJudge={selectedJudge}
                                        onSelectJudge={setSelectedJudge}
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
                    <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
                        <div className="flex-grow flex justify-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setDisplayMode('solo')}
                                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                                        displayMode === 'solo'
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <BiSolidUser size={16} /> Solo Candidates
                                </button>
                                <button
                                    onClick={() => setDisplayMode('pair')}
                                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                                        displayMode === 'pair'
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <HiUsers size={16} /> Pair Candidates
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Select All</span>
                            <label className="relative inline-flex items-center cursor-pointer" onClick={handleSelectAll}>
                                <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${selectAll === null ? 'bg-gray-400' : selectAll ? 'bg-green-600' : 'bg-red-600'}`}>
                                    <div className={`absolute top-[2px] left-[2px] w-6 h-6 bg-white rounded-full shadow-md transition-transform ${selectAll ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                        Assign {selectedJudge ? judges.find(j => j.id === selectedJudge)?.name : 'a Judge'} to Candidates
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayMode === 'solo'
                            ? candidates.map((candidate) => (
                                <div key={candidate.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition">
                                    <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-24 h-25 rounded-full object-cover mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{candidate.name}</h4>
                                    <label className="mt-4 flex items-center space-x-2 cursor-pointer">
                                        <div className={`relative w-14 h-7 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${assignments[candidate.id] ? 'bg-green-600' : 'bg-red-600'}`} onClick={() => handleToggle(candidate.id)}>
                                            <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${assignments[candidate.id] ? 'translate-x-7' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            ))
                            : pairCandidates.map((pair) => (
                                <div key={pair.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4">
                                        {pair.pair_name}
                                    </h2>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex flex-col items-center">
                                            <img src={`http://localhost:8000/storage/${pair.female_picture}`} alt="Female Candidate" className="w-24 h-24 rounded-full object-cover mb-4" />
                                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{pair.female_name}</h4>
                                            <p className="text-gray-500 dark:text-gray-300 text-center">Age: {pair.female_age}</p>
                                            <p className="text-gray-500 dark:text-gray-300 text-center">Vital: {pair.female_vital}</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <img src={`http://localhost:8000/storage/${pair.male_picture}`} alt="Male Candidate" className="w-24 h-24 rounded-full object-cover mb-4" />
                                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{pair.male_name}</h4>
                                            <p className="text-gray-500 dark:text-gray-300 text-center">Age: {pair.male_age}</p>
                                            <p className="text-gray-500 dark:text-gray-300 text-center">Vital: {pair.male_vital}</p>
                                        </div>
                                    </div>
                                    <label className="mt-4 flex items-center space-x-2 cursor-pointer">
                                        <div className={`relative w-14 h-7 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${assignments[pair.id] ? 'bg-green-600' : 'bg-red-600'}`} onClick={() => handleToggle(pair.id)}>
                                            <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${assignments[pair.id] ? 'translate-x-7' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                    </div>

                    <div className="flex justify-center mt-8">
                        <button className={`px-6 py-3 text-white rounded-lg transition duration-300 ${selectedJudge && Object.keys(assignments).length > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`} 
                            onClick={handleSave} disabled={!selectedJudge || loading}>
                            {loading ? 'Saving...' : 'Save Assignments'}
                        </button>
                    </div>
                </div>
            </FlexContainer>
            <ToastContainer />
        </AdminLayout>
    );
}