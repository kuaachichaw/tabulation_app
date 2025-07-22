import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useAssignCandidateBackend = (displayMode) => {
    // State management
    const [judges, setJudges] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [pairCandidates, setPairCandidates] = useState([]);
    const [selectedJudge, setSelectedJudge] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
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
                toast.error('Failed to load initial data');
            }
        };
        fetchInitialData();
    }, []);

    // Fetch assignments when judge or display mode changes
    useEffect(() => {
        const fetchJudgeAssignments = async () => {
            if (!selectedJudge) return;

            try {
                setLoading(true);
                const endpoint = displayMode === 'solo' 
                    ? `/api/assignments/${selectedJudge}` 
                    : `/api/pair-assignments/${selectedJudge}`;
                
                const res = await axios.get(endpoint);

                if (displayMode === 'solo') {
                    const assigned = res.data.reduce((acc, id) => ({ ...acc, [id]: true }), {});
                    setAssignments(assigned);
                    setSelectAll(candidates.every(candidate => assigned[candidate.id]));
                } else {
                    const assigned = Object.keys(res.data).reduce((acc, pairId) => ({
                        ...acc,
                        [pairId]: {
                            male: res.data[pairId].assigned_male === 1,
                            female: res.data[pairId].assigned_female === 1,
                        },
                    }), {});
                    setAssignments(assigned);
                    setSelectAll(pairCandidates.every(pair => assigned[pair.id]?.male && assigned[pair.id]?.female));
                }
            } catch (error) {
                toast.error('Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };

        fetchJudgeAssignments();
    }, [selectedJudge, displayMode, candidates, pairCandidates]);

    // Toggle assignment for a candidate
    const handleToggle = (id, type = null) => {
        setAssignments(prev => {
            const updated = displayMode === 'solo'
                ? { ...prev, [id]: !prev[id] }
                : {
                    ...prev,
                    [id]: {
                        ...prev[id],
                        [type]: !prev[id]?.[type],
                    },
                };

            // Update selectAll state
            const allSelected = displayMode === 'solo'
                ? candidates.every(c => updated[c.id])
                : pairCandidates.every(p => updated[p.id]?.male && updated[p.id]?.female);
            
            setSelectAll(allSelected);
            return updated;
        });
    };

    // Toggle all candidates
    const handleSelectAll = () => {
        const newValue = !selectAll;
        setSelectAll(newValue);
        
        setAssignments(displayMode === 'solo'
            ? candidates.reduce((acc, c) => ({ ...acc, [c.id]: newValue }), {})
            : pairCandidates.reduce((acc, p) => ({
                ...acc,
                [p.id]: { male: newValue, female: newValue }
            }), {})
        );
    };

    // Save assignments to backend
    const handleSave = async () => {
        if (!selectedJudge) {
            toast.error('Please select a judge first');
            return false;
        }

        try {
            setLoading(true);
            const endpoint = displayMode === 'solo' ? '/api/assignments' : '/api/pair-assignments';
            const payload = displayMode === 'solo'
                ? { judge_id: selectedJudge, assignments }
                : {
                    judge_id: selectedJudge,
                    assignments: Object.entries(assignments).reduce((acc, [pairId, { male, female }]) => ({
                        ...acc,
                        [pairId]: {
                            male: male ? 1 : 0,
                            female: female ? 1 : 0,
                        },
                    }), {}),
                };

            await axios.post(endpoint, payload);
            toast.success('Assignments saved successfully');
            return true;
        } catch (error) {
            toast.error('Failed to save assignments');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        judges,
        candidates,
        pairCandidates,
        selectedJudge,
        assignments,
        selectAll,
        loading,
        
        // Setters
        setSelectedJudge,
        
        // Handlers
        handleToggle,
        handleSelectAll,
        handleSave
    };
};