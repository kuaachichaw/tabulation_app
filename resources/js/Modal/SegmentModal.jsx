import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';
import { toast } from 'react-toastify';

const SegmentModal = ({ isOpen, closeModal, mode = 'create' }) => {
    if (!isOpen) return null;

    const [segment, setSegment] = useState('');
    const [criteria, setCriteria] = useState([{ name: '', weight: '' }]);
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state for form submission

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure total criteria weight equals 100%
        const totalWeight = criteria.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
        if (totalWeight !== 100) {
            toast.error("Total weight of criteria must be exactly 100%");
            return;
        }
    
        const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
        if (!csrfToken) {
            console.error('CSRF token is missing');
            return;
        }
    
        const data = { name: segment, criteria };
    
        setIsLoading(true); // Start loading
        try {
            const response = await fetch('/segments/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
    
            setSegment('');
            setCriteria([{ name: '', weight: '' }]); // Reset fields
            toast.success('Segment successfully saved');
            closeModal();
        } catch (error) {
            console.error('Failed to submit:', error);
            toast.error(error.error || "Failed to submit segment");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const handleAddCriteria = () => {
        if (criteria.length < 4) {
            setCriteria([...criteria, { name: '', weight: '' }]);
        } else {
            setShowAlert(true);
        }
    };

    const handleRemoveCriteria = (index) => {
        const updatedCriteria = criteria.filter((_, i) => i !== index);
        setCriteria(updatedCriteria);
    };

    const handleCriteriaChange = (index, field, value) => {
        const updatedCriteria = [...criteria];
        updatedCriteria[index][field] = value;
        setCriteria(updatedCriteria);
    };

    const closeAlert = () => setShowAlert(false);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 transition-opacity ease-in-out duration-300">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full sm:w-[480px] max-w-md relative overflow-hidden">
                <Head title={mode === 'create' ? "Add New Segment" : "Edit Segment"} />

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div>
                            <InputLabel htmlFor="name" value="Name of the Segment" />
                            <TextInput
                                id="name"
                                name="name"
                                className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter Segment name"
                                value={segment}
                                onChange={(e) => setSegment(e.target.value)}
                            />
                        </div>

                        <div>
                            <h4 className="text-white mb-2">Criteria</h4>
                            {criteria.map((sub, index) => (
                                <div key={index} className="mb-4">
                                 
                                    <TextInput
                                        id={`sub_name_${index}`}
                                        name={`sub_name_${index}`}
                                        className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                        value={sub.name}
                                        placeholder='Enter Criteria Name'
                                        onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                                    />
                                  

                                    <InputLabel htmlFor={`weight_${index}`} value="Weight" />
                                    <TextInput
                                        id={`weight_${index}`}
                                        name={`weight_${index}`}
                                        type="number"
                                        className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                        value={sub.weight}
                                        placeholder='Enter Criteria Weight'
                                        onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                                    />
                                   

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCriteria(index)}
                                        className="text-red-500 mt-2 hover:text-red-700 transition duration-200"
                                    >
                                        Remove Criteria
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddCriteria}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                            >
                                Add Criteria
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <button type="button" className="text-gray-400 hover:text-red-500" onClick={closeModal}>
                                Cancel
                            </button>
                            <PrimaryButton className="ms-4">
                                {isLoading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>

                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                    ×
                </button>
            </div>

            {/* Custom Styled Alert */}
            {showAlert && (
                <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
                    <div className="bg-red-500 text-white p-6 rounded-lg w-[90%] max-w-md text-center">
                        <p className="text-xl">You can only add up to 4 criteria.</p>
                        <button
                            onClick={closeAlert}
                            className="mt-4 bg-white text-red-500 px-6 py-2 rounded-md hover:bg-red-100 transition duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SegmentModal;
