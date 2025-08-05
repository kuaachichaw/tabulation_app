import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PairOverallLeaderboardModal = ({ isOpen, closeModal, pairSegments = [] }) => {
    const [weights, setWeights] = useState({
        male: {},
        female: {}
    });
    const [gender, setGender] = useState('male');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const Spinner = () => (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('/PairLeaderboard/index');
                const { maleWeights = {}, femaleWeights = {} } = response.data;
                
                setWeights({
                    male: maleWeights,
                    female: femaleWeights
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.response?.data?.message || 'Failed to load configuration');
                toast.error('Failed to load leaderboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen]);

    const handleWeightChange = (segmentId, value) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        const validatedValue = numericValue === '' ? '' : 
            Math.min(100, Math.max(0, parseFloat(numericValue)));

        setWeights(prev => ({
            ...prev,
            [gender]: {
                ...prev[gender],
                [segmentId]: validatedValue
            }
        }));
    };

    const handleToggle = (segmentId) => {
        setWeights(prev => {
            const currentValue = prev[gender][segmentId];
            return {
                ...prev,
                [gender]: {
                    ...prev[gender],
                    [segmentId]: currentValue === undefined ? '' : undefined
                }
            };
        });
    };

    const calculateTotal = (gender) => {
        return Object.values(weights[gender] || {})
            .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const maleTotal = calculateTotal('male');
        const femaleTotal = calculateTotal('female');

        if (maleTotal !== 100 || femaleTotal !== 100) {
            toast.error('Both male and female totals must equal 100%');
            return;
        }

        const payload = {
            male_segments: Object.entries(weights.male)
                .filter(([_, weight]) => weight !== undefined)
                .map(([segmentId, weight]) => ({
                    pair_segment_id: segmentId,
                    weight: parseFloat(weight) || 0
                })),
            female_segments: Object.entries(weights.female)
                .filter(([_, weight]) => weight !== undefined)
                .map(([segmentId, weight]) => ({
                    pair_segment_id: segmentId,
                    weight: parseFloat(weight) || 0
                }))
        };

        setIsLoading(true);
        try {
            await axios.post('/PairLeaderboard/store', payload);
            toast.success('Configuration saved successfully!');
            setTimeout(closeModal, 1000);
        } catch (error) {
            console.error('Save error:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                toast.error(firstError || 'Validation error');
            } else {
                toast.error(error.response?.data?.message || 'Error saving configuration');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full sm:w-[600px] max-w-md">
                <h2 className="text-white text-xl font-bold mb-4 text-center">
                    🏆 Pair Overall Leaderboard Setup
                </h2>
                
                <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            type="button"
                            onClick={() => setGender('male')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                                gender === 'male' 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            }`}
                        >
                            Male
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-md border transition-colors ${
                                gender === 'female' 
                                    ? 'bg-pink-600 text-white border-pink-600' 
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            }`}
                        >
                            Female
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="text-center p-4 text-red-400">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                            {pairSegments.map(segment => {
                                const isIncluded = weights[gender][segment.id] !== undefined;
                                const weightValue = isIncluded ? weights[gender][segment.id] : '';

                                return (
                                    <div 
                                        key={segment.id} 
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                            gender === 'male' ? 'bg-blue-900/30' : 'bg-pink-900/30'
                                        }`}
                                    >
                                        <span className="text-white flex-1 truncate">{segment.pair_name}</span>
                                        
                                        <label className="relative inline-flex items-center cursor-pointer mx-3">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isIncluded}
                                                onChange={() => handleToggle(segment.id)}
                                            />
                                            <div className="w-14 h-7 bg-red-500 rounded-full peer-checked:bg-green-500 transition-all"></div>
                                            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-7 transition-all"></div>
                                        </label>

                                        <input
                                            type="text"
                                            className="w-24 p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-blue-500"
                                            value={weightValue}
                                            onChange={(e) => handleWeightChange(segment.id, e.target.value)}
                                            disabled={!isIncluded || isLoading}
                                            placeholder="Weight"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="text-white text-center">
                                <div>Male Total:</div>
                                <div className={calculateTotal('male') === 100 ? 'text-green-400' : 'text-red-400'}>
                                    {calculateTotal('male')}%
                                </div>
                            </div>
                            <div className="text-white text-center">
                                <div>Female Total:</div>
                                <div className={calculateTotal('female') === 100 ? 'text-green-400' : 'text-red-400'}>
                                    {calculateTotal('female')}%
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <button 
                                type="button" 
                                className="text-gray-400 hover:text-white transition disabled:opacity-50"
                                onClick={closeModal}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded text-white transition ${
                                    calculateTotal('male') === 100 && 
                                    calculateTotal('female') === 100 && 
                                    !isLoading
                                        ? 'bg-indigo-600 hover:bg-indigo-700'
                                        : 'bg-gray-600 cursor-not-allowed'
                                }`}
                                disabled={
                                    isLoading || 
                                    calculateTotal('male') !== 100 ||
                                    calculateTotal('female') !== 100
                                }
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner /> Saving...
                                    </span>
                                ) : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default PairOverallLeaderboardModal;