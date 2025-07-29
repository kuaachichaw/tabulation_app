import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useAssignSegmentBackend = () => {
    const [judges, setJudges] = useState([]);
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch initial data
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

    // Fetch assignments when segment changes
    useEffect(() => {
        if (!selectedSegmentId || judges.length === 0) return;
    
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);
                const endpoint = selectedSegment.type === 'solo' 
                    ? '/api/judge-segment' 
                    : '/api/pair-judge-segments';
    
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
            } finally {
                setLoading(false);
            }
        };
    
        fetchAssignments();
    }, [selectedSegmentId, judges, segments]);

    // Toggle judge assignment
    const handleToggle = (judgeId) => {
        setAssignments(prev => {
            const updated = { ...prev, [judgeId]: !prev[judgeId] };
            setSelectAll(judges.every(judge => updated[judge.id]));
            return updated;
        });
    };

    // Toggle all judges
    const handleSelectAll = () => {
        const newState = !selectAll;
        setSelectAll(newState);
        const updatedAssignments = {};
        judges.forEach(judge => {
            updatedAssignments[judge.id] = newState;
        });
        setAssignments(updatedAssignments);
    };

    // Save assignments to backend
    const handleSave = async () => {
        if (!selectedSegmentId || Object.keys(assignments).length === 0) {
            toast.error('Please select a segment and make changes first.');
            return false;
        }
    
        setLoading(true);
        try {
            const selectedSegment = segments.find(segment => segment.id === selectedSegmentId);
            const endpoint = selectedSegment.type === 'solo' 
                ? '/api/judge-segment' 
                : '/api/pair-judge-segments';
    
            const payload = selectedSegment.type === 'solo'
                ? { segment_id: selectedSegmentId, assignments }
                : { pair_segment_id: selectedSegmentId, assignments };
    
            await axios.post(endpoint, payload);
            toast.success('Assignments saved successfully');
            return true;
        } catch (error) {
            if (error.response) {
                console.error('Validation errors:', error.response.data.errors);
            }
            toast.error('Failed to save assignments');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        judges,
        segments,
        selectedSegmentId,
        assignments,
        selectAll,
        loading,
        
        // Setters
        setSelectedSegmentId,
        
        // Handlers
        handleToggle,
        handleSelectAll,
        handleSave
    };
};