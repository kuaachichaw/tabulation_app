import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export const useLeaderboardBackend = (displayMode = 'solo') => {
    const [segments, setSegments] = useState([]);
    const [pairSegments, setPairSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOverall, setIsOverall] = useState(false);
    const [error, setError] = useState(null);
    const [judges, setJudges] = useState([]);
    const initialMount = useRef(true);

    const fetchData = async (url, errorMessage) => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(url);
            return res.data;
        } catch (err) {
            console.error(errorMessage, err);
            // Don't set error for initial failed requests
            if (!initialMount.current) {
                setError(`${errorMessage}: ${err.response?.data?.message || err.message}`);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = useCallback(async () => {
        // Always fetch judges
        const judgesData = await fetchData('/api/judges', 'Error fetching judges');
        if (judgesData) setJudges(judgesData);

        // Fetch segments based on displayMode
        if (displayMode === 'solo') {
            const segmentsData = await fetchData('/api/segments', 'Failed to load segments');
            if (segmentsData) {
                setSegments(segmentsData);
                if (segmentsData.length > 0 && !selectedSegmentId) {
                    setSelectedSegmentId(segmentsData[0].id);
                }
            }
        } else {
            const pairSegmentsData = await fetchData('/api/pair-segments', 'Failed to load pair segments');
            if (pairSegmentsData) {
                setPairSegments(pairSegmentsData);
                // Don't auto-select segment in pair mode to prevent initial errors
            }
        }
    }, [displayMode, selectedSegmentId]);

    const fetchLeaderboardData = useCallback(async () => {
        // Don't fetch if in pair mode without selected segment
        if (displayMode === 'pair' && !selectedSegmentId && !isOverall) return;
        
        // Don't fetch if in solo mode without selected segment and not overall
        if (displayMode === 'solo' && !selectedSegmentId && !isOverall) return;

        try {
            setLoading(true);
            setError(null);

            if (displayMode === 'solo') {
                const url = isOverall 
                    ? '/leaderboard/overall' 
                    : `/leaderboard/${selectedSegmentId}`;
                const data = await fetchData(url, 'Failed to load leaderboard');
                if (data) setLeaderboard(data);
            } else {
                // Only set error if this isn't the initial mount
                const showError = !initialMount.current;
                
                const [maleData, femaleData] = await Promise.all([
                    fetchData(
                        isOverall 
                            ? '/PairLeaderboard/PairOverAll/male' 
                            : `/PairLeaderboard/segment/${selectedSegmentId}/male`,
                        showError ? 'Failed to load male pairs' : ''
                    ),
                    fetchData(
                        isOverall 
                            ? '/PairLeaderboard/PairOverAll/female' 
                            : `/PairLeaderboard/segment/${selectedSegmentId}/female`,
                        showError ? 'Failed to load female pairs' : ''
                    )
                ]);

                if (maleData && femaleData) {
                    setLeaderboard({
                        male: maleData.leaderboard,
                        female: femaleData.leaderboard,
                        segment_name: maleData.segment_name
                    });
                }
            }
        } finally {
            setLoading(false);
            initialMount.current = false;
        }
    }, [displayMode, isOverall, selectedSegmentId]);

    useEffect(() => {
        fetchInitialData();
    }, [displayMode, fetchInitialData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeaderboardData();
        }, 100);

        return () => clearTimeout(timer);
    }, [fetchLeaderboardData]);

    return {
        segments,
        pairSegments,
        selectedSegmentId,
        setSelectedSegmentId,
        leaderboard,
        loading,
        error,
        judges,
        isOverall,
        setIsOverall,
        fetchLeaderboardData,
        displayMode
    };
};