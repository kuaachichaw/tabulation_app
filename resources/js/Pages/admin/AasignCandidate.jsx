import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AassignCandidate() {
    const [judges, setJudges] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedJudge, setSelectedJudge] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [judgesRes, candidatesRes] = await Promise.all([
                    axios.get('/api/judges'),
                    axios.get('/api/candidates'),
                ]);
                setJudges(judgesRes.data);
                setCandidates(candidatesRes.data);
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
                const res = await axios.get(`/api/assignments/${selectedJudge}`);
                const assigned = res.data.reduce((acc, id) => ({ ...acc, [id]: true }), {});
                setAssignments(assigned);
                const allAssigned = candidates.length > 0 && candidates.every(candidate => assigned[candidate.id]);
                setSelectAll(allAssigned ? true : false);
            } catch (error) {
                toast.error('Failed to load assignments');
            }
        };
        fetchAssignments();
    }, [selectedJudge, candidates]);

    const handleToggle = (candidateId) => {
        setAssignments((prev) => {
            const updatedAssignments = { ...prev, [candidateId]: !prev[candidateId] };
            const allAssigned = candidates.every(candidate => updatedAssignments[candidate.id]);
            setSelectAll(allAssigned ? true : false);
            return updatedAssignments;
        });
    };

    const handleSelectAll = () => {
        const newState = selectAll ? false : true;
        setSelectAll(newState);
        const updatedAssignments = {};
        candidates.forEach(candidate => {
            updatedAssignments[candidate.id] = newState;
        });
        setAssignments(updatedAssignments);
    };

    const handleSave = async () => {
        if (!selectedJudge) {
            toast.error('Please select a judge first.');
            return;
        }
        try {
            await axios.post('/api/assignments', { judge_id: selectedJudge, assignments });
            toast.success('Assignments saved successfully');
        } catch (error) {
            toast.error('Failed to save assignments');
        }
    };

    return (
        <AdminLayout
                   header={
                       <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                           Assign Judge to Candidates 
                       </h2>
                   }
               >
            <Head title="Assign Candidate" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Select a Judge</h3>
                        <div className="space-y-4">
                            {judges.map((judge) => (
                                <div key={judge.id} className={`cursor-pointer flex items-center space-x-4 p-4 rounded-lg transition duration-200 ease-in-out ${selectedJudge === judge.id ? 'bg-indigo-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-indigo-600 hover:text-white'}`} onClick={() => setSelectedJudge(judge.id)}>
                                    <img src={`/storage/${judge.picture}`} alt={judge.name} className="w-12 h-12 rounded-full object-cover" />
                                    <span className="text-lg font-medium">{judge.name}</span>
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
                            Assign {selectedJudge ? judges.find(j => j.id === selectedJudge)?.name : 'a Judge'} to Candidates
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidates.map((candidate) => (
                                <div key={candidate.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition">
                                    <img src={`/storage/${candidate.picture}`} alt={candidate.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{candidate.name}</h4>
                                    <label className="mt-4 flex items-center space-x-2 cursor-pointer">
                                        <div className={`relative w-14 h-7 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${assignments[candidate.id] ? 'bg-green-600' : 'bg-red-600'}`} onClick={() => handleToggle(candidate.id)}>
                                            <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${assignments[candidate.id] ? 'translate-x-7' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center space-x-6 mt-8">
                            <button className={`px-6 py-3 text-white rounded-lg transition duration-300 ${selectedJudge ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`} onClick={handleSave} disabled={!selectedJudge || loading}>{loading ? 'Saving...' : 'Save Assignment'}</button>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </AdminLayout>
    );
}
