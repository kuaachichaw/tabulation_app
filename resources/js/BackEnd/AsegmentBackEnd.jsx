// AsegmentBackEnd.jsx
import { toast } from 'react-toastify';

export const fetchSoloSegments = async () => {
    try {
        const response = await fetch('/api/segments');
        if (!response.ok) throw new Error('Failed to fetch Solo Segments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Solo Segments:', error);
        toast.error('Failed to load Solo Segments');
        throw error;
    }
};

export const fetchPairSegments = async () => {
    try {
        const response = await fetch('/api/pair-segments');
        if (!response.ok) throw new Error('Failed to fetch Pair Segments');
        const data = await response.json();
        
        // Ensure each pair has criterias array and proper structure
        return data.map(pair => ({
            ...pair,
            male_name: pair.male_name || 'Male Segment',
            female_name: pair.female_name || 'Female Segment',
            criterias: Array.isArray(pair.criterias) 
                ? pair.criterias.map(c => ({
                    ...c,
                    criteria_name: c.criteria_name || 'Unnamed Criteria',
                    weight: c.weight || 0,
                    type: c.type || 'male'
                }))
                : []
        }));
    } catch (error) {
        console.error('Error fetching Pair Segments:', error);
        toast.error('Failed to load Pair Segments');
        throw error;
    }
};

export const deleteSegment = async (segmentId, isPair = false) => {
    try {
        const endpoint = isPair ? `/api/pair-segments/${segmentId}` : `/api/segments/${segmentId}`;
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
            },
        });

        if (!response.ok) throw new Error('Failed to delete Segment');
        toast.success('Segment deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting Segment:', error);
        toast.error('Failed to delete Segment');
        throw error;
    }
};