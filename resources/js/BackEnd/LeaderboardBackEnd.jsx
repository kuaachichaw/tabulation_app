import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useLeaderboardBackend = () => {
    const [segments, setSegments] = useState([]);
    const [selectedSegmentId, setSelectedSegmentId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOverall, setIsOverall] = useState(false);
    const [error, setError] = useState(null);
    const [judges, setJudges] = useState([]);

    const fetchData = async (url, errorMessage) => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(url);
            return res.data;
        } catch (err) {
            console.error(errorMessage, err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchJudges = useCallback(async () => {
        const data = await fetchData('/api/judges', 'Error fetching judges');
        if (data) setJudges(data);
    }, []);

    const fetchSegments = useCallback(async () => {
        const data = await fetchData('/api/segments', 'Failed to load segments');
        if (data) {
            setSegments(data);
            if (data.length > 0) {
                setSelectedSegmentId(data[0].id);
            }
        }
    }, []);

    const fetchSegmentLeaderboard = useCallback(async (displayMode = 'solo') => {
        const data = await fetchData(
            `/leaderboard/${selectedSegmentId}?type=${displayMode}`,
            'Failed to load leaderboard'
        );
        if (data) setLeaderboard(data);
    }, [selectedSegmentId]);

    const fetchOverallLeaderboard = useCallback(async (displayMode = 'solo') => {
        const data = await fetchData(
            `/leaderboard/overall?type=${displayMode}`,
            'Failed to load overall leaderboard'
        );
        if (data) setLeaderboard(data);
    }, []);

    useEffect(() => {
        fetchJudges();
        fetchSegments();
    }, [fetchJudges, fetchSegments]);

    useEffect(() => {
        if (isOverall) {
            fetchOverallLeaderboard();
        } else if (selectedSegmentId) {
            fetchSegmentLeaderboard();
        }
    }, [selectedSegmentId, isOverall, fetchOverallLeaderboard, fetchSegmentLeaderboard]);

    return {
        segments,
        selectedSegmentId,
        setSelectedSegmentId,
        leaderboard,
        loading,
        error,
        judges,
        isOverall,
        setIsOverall,
        fetchSegmentLeaderboard,
        fetchOverallLeaderboard
    };
};