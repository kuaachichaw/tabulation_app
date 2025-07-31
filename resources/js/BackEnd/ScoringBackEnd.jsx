// ScoringBackEnd.js
import axios from 'axios';
import { toast } from 'react-toastify';


// API Endpoints
export const API_ENDPOINTS = {
  CANDIDATES: '/api/candidates/assigned',
  JUDGE_SEGMENTS: '/api/judge-segments',
  PAIR_CANDIDATES: '/api/pair-candidates/assigned',
  PAIR_JUDGE_SEGMENTS: '/api/pair-judge-segments',
  SCORES: '/api/scores',
  CANDIDATE_SCORES: (candidateId) => `/api/scores/${candidateId}`,
  PAIR_SCORES: '/api/pair-scores',
  PAIR_CANDIDATE_SCORES: (pairId) => `/api/pair-scores/${pairId}`,
  DISPLAY_SETTINGS: '/display/get' // New endpoint
};

// Toast Messages
export const TOAST_MESSAGES = {
  SAVING: 'Saving scores...',
  SUCCESS: 'Scores saved successfully!',
  ERROR: 'Failed to save scores.',
  INVALID_DATA: 'Invalid data received from the server.',
  LOADING_ERROR: 'Failed to load data',
  SCORE_ERROR: 'Score must be between 1 and 10.',
  SELECT_CANDIDATE: 'Please select a candidate first.',
  FILL_SCORES: 'Please fill in all scores before saving.',
  SETTINGS_ERROR: 'Failed to load display settings'
};


// Get current display settings
export const getDisplaySettings = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.DISPLAY_SETTINGS);
    return response.data.Display_Scoring ?? 2; // Default to both if not set
  } catch (error) {
    console.error("Error fetching display settings:", error);
    toast.error(TOAST_MESSAGES.SETTINGS_ERROR);
    return 2; // Fallback to both
  }
};

// Fetch data based on display mode
export const fetchData = async () => {
  try {
    const displayMode = await getDisplaySettings();
    
    // Initialize empty result object
    const result = {
      candidates: [],
      pairCandidates: [],
      segments: [],
      pairJudgeSegments: [],
      displayMode // Include display mode in result
    };

    // Individual candidates and segments (mode 0 or 2)
    if (displayMode === 0 || displayMode === 2) {
      const [candidatesRes, segmentsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.CANDIDATES, { withCredentials: true }),
        axios.get(API_ENDPOINTS.JUDGE_SEGMENTS, { withCredentials: true })
      ]);
      
      if (candidatesRes.data) result.candidates = candidatesRes.data;
      if (segmentsRes.data) result.segments = segmentsRes.data;
    }

    // Pair candidates and segments (mode 1 or 2)
    if (displayMode === 1 || displayMode === 2) {
      const [pairCandidatesRes, pairJudgeSegmentsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.PAIR_CANDIDATES, { withCredentials: true }),
        axios.get(API_ENDPOINTS.PAIR_JUDGE_SEGMENTS, { withCredentials: true })
      ]);
      
      if (pairCandidatesRes.data) result.pairCandidates = pairCandidatesRes.data;
      if (pairJudgeSegmentsRes.data) result.pairJudgeSegments = pairJudgeSegmentsRes.data;
    }

    return result;
    
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error(TOAST_MESSAGES.LOADING_ERROR);
    return {
      candidates: [],
      pairCandidates: [],
      segments: [],
      pairJudgeSegments: [],
      displayMode: 2 // Fallback to both
    };
  }
};

// Handle score changes (unchanged)
export const handleScoreChange = (scores, setScores, segmentId, criterionId, value) => {
  if (value === "") {
    setScores((prev) => ({
      ...prev,
      [segmentId]: {
        ...prev[segmentId],
        [criterionId]: value === "" ? null : value
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

// Save individual scores (unchanged)
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
    console.error("Error in toast.promise:", error);
  } finally {
    setLoading(false);
  }
};


// Save pair scores (unchanged)
export const PairhandleSave = async (selectedCandidate, scores, pairJudgeSegments, setLoading) => {
  if (!selectedCandidate) {
    toast.error(TOAST_MESSAGES.SELECT_CANDIDATE);
    return;
  }

  const [pairId, gender] = selectedCandidate.split('-');
  const PairallScoresFilled = pairJudgeSegments.every(segment => {
    const allCriteriaFilled = segment.paircriteria
      .filter(criterion => criterion.type === gender)
      .every(criterion => {
        const score = scores[segment.id]?.[criterion.id];
        return score !== null && score !== undefined;
      });
    return allCriteriaFilled;
  });

  if (!PairallScoresFilled) {
    toast.error(TOAST_MESSAGES.FILL_SCORES);
    return;
  }

  const formattedScores = Object.entries(scores).flatMap(([segmentId, criteriaScores]) =>
    Object.entries(criteriaScores).map(([criterionId, score]) => ({
      pair_segment_id: segmentId,
      pair_criteria_id: criterionId,
      score: ((score || 0) * (pairJudgeSegments.find(s => s.id == segmentId)?.paircriteria.find(c => c.id == criterionId)?.weight || 0)) / 10,
    }))
  );

  setLoading(true);
  try {
    await toast.promise(
      axios.post(API_ENDPOINTS.PAIR_SCORES, {
        pair_id: pairId,
        gender,
        scores: formattedScores,
      }),
      {
        pending: TOAST_MESSAGES.SAVING,
        success: TOAST_MESSAGES.SUCCESS,
        error: TOAST_MESSAGES.ERROR,
      }
    );
  } catch (error) {
    console.error("Error in toast.promise:", error);
  } finally {
    setLoading(false);
  }
};

// Handle candidate selection
export const handleCandidateSelection = async (
    candidateId,
    setSelectedCandidate,
    setScores,
    segments,
    pairJudgeSegments
) => {
    // Ensure candidateId is treated as a string
    const candidateIdStr = String(candidateId);
    setSelectedCandidate(candidateIdStr);
    setScores({});

    try {
        if (candidateIdStr.includes('-')) {
            // Pair candidate
            const [pairId, gender] = candidateIdStr.split('-');

            // Fetch scores for the pair candidate
            const response = await axios.get(API_ENDPOINTS.PAIR_CANDIDATE_SCORES(pairId), {
                params: { gender },
            });
            const fetchedScores = response.data;

            // Format scores for display
            const formattedScores = {};
            fetchedScores.forEach(({ pair_segment_id, pair_criteria_id, score }) => {
                const segment = pairJudgeSegments.find((s) => s.id == pair_segment_id);
                const criterion = segment?.paircriteria.find((c) => c.id == pair_criteria_id);

                if (criterion) {
                    const originalScore = criterion.weight > 0 ? (score * 10) / criterion.weight : 0;
                    if (!formattedScores[pair_segment_id]) {
                        formattedScores[pair_segment_id] = {};
                    }
                    formattedScores[pair_segment_id][pair_criteria_id] = Number(originalScore.toFixed(2)) || 0;
                }
            });

            setScores(formattedScores);
        } else {
            // Individual candidate
            const response = await axios.get(API_ENDPOINTS.CANDIDATE_SCORES(candidateIdStr), {
                withCredentials: true,
            });
            const fetchedScores = response.data;

            // Format scores for display
            const formattedScores = {};
            fetchedScores.forEach(({ segment_id, criterion_id, score }) => {
                const segment = segments.find((s) => s.id == segment_id);
                const criterion = segment?.criteria.find((c) => c.id == criterion_id);

                if (criterion) {
                    const originalScore = criterion.weight > 0 ? (score * 10) / criterion.weight : 0;
                    if (!formattedScores[segment_id]) {
                        formattedScores[segment_id] = {};
                    }
                    formattedScores[segment_id][criterion_id] = Number(originalScore.toFixed(2)) || 0;
                }
            });

            setScores(formattedScores);
        }
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

export const savePairScore = async (scoreData) => {
    try {
        const response = await axios.post(API_ENDPOINTS.PAIR_SCORES, scoreData);
        console.log(response.data.message);
        return response.data;
    } catch (error) {
        console.error('Error saving score:', error.response.data);
        throw error;
    }
};


export const getPairScores = async (pairId) => {
    try {
        const response = await axios.get(API_ENDPOINTS.PAIR_CANDIDATE_SCORES(pairId));
        console.log(response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error retrieving scores:', error.response.data);
        throw error;
    }
};

export const fetchPairScores = async (pairId, gender) => {
    try {
        const response = await axios.get(API_ENDPOINTS.PAIR_CANDIDATE_SCORES(pairId), {
            params: { gender }, // Pass gender as a query parameter
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pair scores:", error);
        toast.error(TOAST_MESSAGES.LOADING_ERROR);
        return null;
    }
};


// Calculate total score
export const calculateTotalScore = (scores, segments, pairJudgeSegments, isPairCandidate, selectedGender) => {
    return Object.entries(scores).reduce((acc, [segmentId, segmentScores]) => {
      // Determine which segments to use based on whether it's a pair candidate
      const segment = isPairCandidate
        ? pairJudgeSegments.find((s) => s.id == segmentId)
        : segments.find((s) => s.id == segmentId);
  
      if (!segment) return acc;
  
      // Determine which criteria to use based on whether it's a pair candidate
      const criteria = isPairCandidate
        ? segment.paircriteria.filter((c) => c.type === selectedGender) // Filter by selected gender
        : segment.criteria;
  
      return (
        acc +
        Object.entries(segmentScores).reduce((sum, [criterionId, score]) => {
          const criterion = criteria.find((c) => c.id == criterionId);
          return sum + (criterion ? ((score || 0) * criterion.weight) / 10 : 0);
        }, 0)
      );
    }, 0).toFixed(2); // Return the total score as a fixed decimal
  };

// Calculate progress percentage
export const calculateProgress = (scores, segments, pairJudgeSegments, isPairCandidate, selectedGender) => {
    // Calculate total criteria
    const totalCriteria = isPairCandidate
      ? pairJudgeSegments.reduce((acc, segment) => {
          return acc + segment.paircriteria.filter((c) => c.type === selectedGender).length;
        }, 0)
      : segments.reduce((acc, segment) => acc + segment.criteria.length, 0);
  
    // Calculate filled criteria
    const filledCriteria = Object.values(scores).reduce((acc, segmentScores) => {
      return acc + Object.values(segmentScores).filter((score) => score !== null).length;
    }, 0);
  
    // Calculate progress percentage
    return ((filledCriteria / totalCriteria) * 100).toFixed(0);
  };