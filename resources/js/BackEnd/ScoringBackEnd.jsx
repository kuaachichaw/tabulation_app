// ScoringBackEnd.js
import axios from 'axios';
import { toast } from 'react-toastify';

// API Endpoints
export const API_ENDPOINTS = {
    CANDIDATES: '/api/candidates/assigned',
    JUDGE_SEGMENTS: '/api/judge-segments',

    PAIR_CANDIDATES: '/api/pair-candidates/assigned',
    PAIR_JUDGE_SEGMENTS: '/api/pair-judge-segments', // Add this line

    SCORES: '/scores',
    CANDIDATE_SCORES: (candidateId) => `/api/scores/${candidateId}`,
};

// Toast Messages
export const TOAST_MESSAGES = {
    SAVING: 'Saving scores...',
    SUCCESS: 'Scores saved successfully!',
    ERROR: 'Failed to save scores.',
    INVALID_DATA: 'Invalid data received from the server.',
    LOADING_ERROR: 'Failed to load data',
    SCORE_ERROR: 'Score must be between 0 and 10.',
    SELECT_CANDIDATE: 'Please select a candidate first.',
    FILL_SCORES: 'Please fill in all scores before saving.',
};

// Fetch candidates, pair candidates, and segments
export const fetchData = async () => {
    try {
        const [candidatesRes, pairCandidatesRes, segmentsRes, pairJudgeSegmentsRes] = await Promise.all([
            axios.get(API_ENDPOINTS.CANDIDATES, { withCredentials: true }),
            axios.get(API_ENDPOINTS.PAIR_CANDIDATES, { withCredentials: true }),
            axios.get(API_ENDPOINTS.JUDGE_SEGMENTS, { withCredentials: true }),
            axios.get(API_ENDPOINTS.PAIR_JUDGE_SEGMENTS, { withCredentials: true }),
        ]);

        if (!candidatesRes.data || !segmentsRes.data || !pairCandidatesRes.data || !pairJudgeSegmentsRes.data) {
            toast.error(TOAST_MESSAGES.INVALID_DATA);
            return null;
        }

        return {
            candidates: candidatesRes.data,
            pairCandidates: pairCandidatesRes.data,
            segments: segmentsRes.data,
            pairJudgeSegments: pairJudgeSegmentsRes.data,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(TOAST_MESSAGES.LOADING_ERROR);
        return null;
    }
};
// Handle score changes
export const handleScoreChange = (scores, setScores, segmentId, criterionId, value) => {
    if (value === "") {
        setScores((prev) => ({
            ...prev,
            [segmentId]: {
                ...prev[segmentId],
                [criterionId]: null,
            },
        }));
        return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        toast.error(TOAST_MESSAGES.SCORE_ERROR);
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

// Save scores to the server
export const handleSave = async (selectedCandidate, scores, segments, setLoading) => {
    if (!selectedCandidate) {
        toast.error(TOAST_MESSAGES.SELECT_CANDIDATE);
        return;
    }

    const allScoresFilled = segments.every(segment =>
        segment.criteria.every(criterion =>
            scores[segment.id]?.[criterion.id] !== null && scores[segment.id]?.[criterion.id] !== undefined
        )
    );

    if (!allScoresFilled) {
        toast.error(TOAST_MESSAGES.FILL_SCORES);
        return;
    }

    const formattedScores = Object.entries(scores).flatMap(([segmentId, criteriaScores]) =>
        Object.entries(criteriaScores).map(([criterionId, score]) => ({
            segment_id: segmentId,
            criterion_id: criterionId,
            score: ((score || 0) * (segments.find(s => s.id == segmentId)?.criteria.find(c => c.id == criterionId)?.weight || 0)) / 10,
        }))
    );

    setLoading(true);
    try {
        await toast.promise(
            axios.post(API_ENDPOINTS.SCORES, {
                candidate_id: selectedCandidate,
                scores: formattedScores,
            }),
            {
                pending: TOAST_MESSAGES.SAVING,
                success: TOAST_MESSAGES.SUCCESS,
                error: TOAST_MESSAGES.ERROR,
            }
        );
    } catch (error) {
        console.error('Error saving scores:', error);
    } finally {
        setLoading(false);
    }
};

// Calculate total score
export const calculateTotalScore = (scores, segments) => {
    return Object.entries(scores).reduce((acc, [segmentId, segmentScores]) => {
        const segment = segments.find(s => s.id == segmentId);
        if (!segment) return acc;

        return acc + Object.entries(segmentScores).reduce((sum, [criterionId, score]) => {
            const criterion = segment.criteria.find(c => c.id == criterionId);
            return sum + (criterion ? ((score || 0) * criterion.weight) / 10 : 0);
        }, 0);
    }, 0).toFixed(2);
};

// Handle candidate selection
export const handleCandidateSelection = async (candidateId, setSelectedCandidate, setScores, segments) => {
    setSelectedCandidate(candidateId);
    setScores({});

    try {
        const response = await axios.get(API_ENDPOINTS.CANDIDATE_SCORES(candidateId), { withCredentials: true });
        const fetchedScores = response.data;

        const formattedScores = {};
        fetchedScores.forEach(({ segment_id, criterion_id, score }) => {
            const segment = segments.find(s => s.id == segment_id);
            const criterion = segment?.criteria.find(c => c.id == criterion_id);

            if (criterion) {
                const originalScore = criterion.weight > 0 ? (score * 10) / criterion.weight : 0;
                if (!formattedScores[segment_id]) {
                    formattedScores[segment_id] = {};
                }
                formattedScores[segment_id][criterion_id] = Number(originalScore.toFixed(2)) || 0;
            }
        });

        setScores(formattedScores);
    } catch (error) {
        console.error("Error fetching scores:", error);
        toast.error(TOAST_MESSAGES.LOADING_ERROR);
    }
};

// Toggle score locking
export const toggleLock = (candidateId, lockedCandidates, setLockedCandidates) => {
    if (lockedCandidates.includes(candidateId)) {
        setLockedCandidates(lockedCandidates.filter(id => id !== candidateId));
    } else {
        setLockedCandidates([...lockedCandidates, candidateId]);
    }
};

// Calculate progress percentage
export const calculateProgress = (scores, segments) => {
    const totalCriteria = segments.reduce((acc, segment) => acc + segment.criteria.length, 0);
    const filledCriteria = Object.values(scores).reduce((acc, segmentScores) => acc + Object.values(segmentScores).filter(score => score !== null).length, 0);
    return ((filledCriteria / totalCriteria) * 100).toFixed(0);
};