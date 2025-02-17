import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { toast } from 'react-toastify';
import axios from 'axios';

const OverallLeaderboardModal = ({ isOpen, closeModal, segments = [] }) => {
    const [selectedSegments, setSelectedSegments] = useState([]);

    // ✅ Only fetch data when modal opens
    useEffect(() => {
        if (!isOpen) return; // Prevents unnecessary execution

        axios.get('/overall-leaderboard')
            .then(response => {
                const { segments, overallSegments } = response.data;

                setSelectedSegments(
                    segments.map(segment => ({
                        id: segment.id,
                        name: segment.name,
                        included: !!overallSegments[segment.id], // ✅ Convert to boolean
                        weight: overallSegments[segment.id] ? overallSegments[segment.id] : ''
                    }))
                );
            })
            .catch(error => {
                console.error("Error fetching leaderboard data:", error);
                setSelectedSegments([]); // ✅ Ensure no crashes
            });

    }, [isOpen]);  // ✅ Runs only when modal opens

    // ✅ Toggle segment selection
    const handleToggle = (index) => {
        setSelectedSegments(prev => {
            const updatedSegments = [...prev];
            updatedSegments[index].included = !updatedSegments[index].included;
            if (!updatedSegments[index].included) updatedSegments[index].weight = ''; // Reset weight if unchecked
            return updatedSegments;
        });
    };

    // ✅ Handle weight input
    const handleWeightChange = (index, value) => {
        setSelectedSegments(prev => {
            const updatedSegments = [...prev];
            updatedSegments[index].weight = value;
            return updatedSegments;
        });
    };

    // ✅ Compute total weight
    const totalWeight = selectedSegments.reduce((sum, seg) => sum + (parseFloat(seg.weight) || 0), 0);

    // ✅ Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevents page refresh
    
        const payload = {
            segments: selectedSegments
                .filter(segment => segment.included)  // ✅ Only included segments
                .map(segment => ({
                    segment_id: segment.id,  // ✅ Ensure backend expects `segment_id`
                    weight: parseFloat(segment.weight) || 0  // ✅ Convert weight to number
                }))
        };
    
        try {
            const response = await axios.post('/overall-leaderboard/save', payload);
            console.log('Response:', response.data);
            toast.success('Overall leaderboard saved successfully!');
            closeModal();
        } catch (error) {
            console.error('Failed to save overall leaderboard:', error.response?.data || error);
            toast.error('Error saving overall leaderboard');
        }
    };

    // ✅ Ensure modal renders but stays hidden if not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full sm:w-[500px] max-w-md animate-fadeIn">
                <h2 className="text-white text-xl font-bold mb-4 text-center">🏆 Overall Leaderboard Setup 🏆</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                        {selectedSegments.map((segment, index) => (
                            <div key={segment.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg shadow">
                                <span className="text-white flex-1 font-medium">{segment.name}</span>

                                {/* Toggle Switch (Red OFF, Green ON) */}
                                <label 
                                    className="relative inline-flex items-center cursor-pointer mx-3" 
                                    aria-label={`Toggle inclusion for ${segment.name}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={segment.included}
                                        onChange={() => handleToggle(index)}
                                    />
                                    <div className="w-14 h-7 bg-red-500 rounded-full peer-checked:bg-green-500 transition-all duration-300"></div>
                                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-7 transition-all duration-300"></div>
                                </label>

                                <TextInput
                                    type="number"
                                    className="w-24 p-2 bg-gray-700 text-white rounded-lg text-center border border-gray-600 focus:ring-2 focus:ring-blue-500"
                                    value={segment.weight}
                                    placeholder="%"
                                    disabled={!segment.included}
                                    onChange={(e) => handleWeightChange(index, e.target.value)}
                                    min="0"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Total Weight Display */}
                    <div className="mt-4 text-white text-center text-lg font-semibold">
                        Total: <span className={totalWeight === 100 ? 'text-green-400' : 'text-red-400'}>{totalWeight}%</span>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button type="button" className="text-gray-400 hover:text-red-500 transition" onClick={closeModal}>
                            Cancel
                        </button>
                        <PrimaryButton 
                            className="px-6 py-2 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={totalWeight !== 100 || selectedSegments.every(seg => !seg.included)}
                        >
                            Save
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OverallLeaderboardModal;
