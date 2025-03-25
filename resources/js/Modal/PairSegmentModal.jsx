import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';
import { toast } from 'react-toastify';

const PairSegmentModal = ({ isOpen, closeModal, mode = 'create' }) => {
    if (!isOpen) return null;

    const [pairName, setPairName] = useState('');
    const [maleSegment, setMaleSegment] = useState('');
    const [femaleSegment, setFemaleSegment] = useState('');
    const [maleCriteria, setMaleCriteria] = useState([{ name: '', weight: '' }]);
    const [femaleCriteria, setFemaleCriteria] = useState([{ name: '', weight: '' }]);
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure total criteria weight equals 100% for both male and female segments
        const maleTotalWeight = maleCriteria.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
        const femaleTotalWeight = femaleCriteria.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0);
    
        if (maleTotalWeight !== 100 || femaleTotalWeight !== 100) {
            toast.error("Total weight of criteria for both segments must be exactly 100%");
            return;
        }
    
        const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
        if (!csrfToken) {
            console.error('CSRF token is missing');
            return;
        }
    
        const data = {
            pair_name: pairName,
            male_name: maleSegment,
            female_name: femaleSegment,
            male_criterias: maleCriteria,
            female_criterias: femaleCriteria,
        };
    
        setIsLoading(true);
        try {
            const response = await fetch('/api/pair-segments', {
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
    
            // Reset fields
            setPairName('');
            setMaleSegment('');
            setFemaleSegment('');
            setMaleCriteria([{ name: '', weight: '' }]);
            setFemaleCriteria([{ name: '', weight: '' }]);
            toast.success('Pair Segment successfully saved');
            closeModal();
        } catch (error) {
            console.error('Failed to submit:', error);
            toast.error(error.error || "Failed to submit pair segment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCriteria = (setCriteria, criteria) => {
        if (criteria.length < 4) {
            setCriteria([...criteria, { name: '', weight: '' }]);
        } else {
            setShowAlert(true);
        }
    };

    const handleRemoveCriteria = (setCriteria, criteria, index) => {
        const updatedCriteria = criteria.filter((_, i) => i !== index);
        setCriteria(updatedCriteria);
    };

    const handleCriteriaChange = (setCriteria, criteria, index, field, value) => {
        const updatedCriteria = [...criteria];
        updatedCriteria[index][field] = value;
        setCriteria(updatedCriteria);
    };

    const closeAlert = () => setShowAlert(false);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 transition-opacity ease-in-out duration-300">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full sm:w-[800px] max-w-2xl relative overflow-hidden">
                <Head title={mode === 'create' ? "Add New Pair Segment" : "Edit Pair Segment"} />

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {/* Pair Name (Centered) */}
                        <div className="text-center">
                            <InputLabel htmlFor="pair_name" value="Segment Title" />
                            <TextInput
                                id="pair_name"
                                name="pair_name"
                                className="mt-2 block w-full mx-auto border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 max-w-md"
                                placeholder="Enter Segment Name"
                                value={pairName}
                                onChange={(e) => setPairName(e.target.value)}
                            />
                        </div>

                        {/* Male and Female Segments (Side by Side) */}
                        <div className="flex flex-col sm:flex-row gap-6">
                              {/* Female Segment */}
                              <div className="flex-1">
                                <InputLabel htmlFor="female_segment" value="Female Segment Name" />
                                <TextInput
                                    id="female_segment"
                                    name="female_segment"
                                    className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter Female Segment Name"
                                    value={femaleSegment}
                                    onChange={(e) => setFemaleSegment(e.target.value)}
                                />

                                <h4 className="text-white mb-2 mt-4">Female Criteria</h4>
                                {femaleCriteria.map((sub, index) => (
                                    <div key={index} className="mb-4">
                                        <TextInput
                                            id={`female_sub_name_${index}`}
                                            name={`female_sub_name_${index}`}
                                            className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                            value={sub.name}
                                            placeholder="Enter Female Criteria Name"
                                            onChange={(e) => handleCriteriaChange(setFemaleCriteria, femaleCriteria, index, 'name', e.target.value)}
                                        />

                                        <InputLabel htmlFor={`female_weight_${index}`} value="Weight" />
                                        <TextInput
                                            id={`female_weight_${index}`}
                                            name={`female_weight_${index}`}
                                            type="number"
                                            className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                            value={sub.weight}
                                            placeholder="Enter Female Criteria Weight"
                                            onChange={(e) => handleCriteriaChange(setFemaleCriteria, femaleCriteria, index, 'weight', e.target.value)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCriteria(setFemaleCriteria, femaleCriteria, index)}
                                            className="text-red-500 mt-2 hover:text-red-700 transition duration-200"
                                        >
                                            Remove Criteria
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddCriteria(setFemaleCriteria, femaleCriteria)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                                >
                                    Add Female Criteria
                                </button>
                            </div>
                            {/* Male Segment */}
                            <div className="flex-1">
                                <InputLabel htmlFor="male_segment" value="Male Segment Name" />
                                <TextInput
                                    id="male_segment"
                                    name="male_segment"
                                    className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter Male Segment Name"
                                    value={maleSegment}
                                    onChange={(e) => setMaleSegment(e.target.value)}
                                />

                                <h4 className="text-white mb-2 mt-4">Male Criteria</h4>
                                {maleCriteria.map((sub, index) => (
                                    <div key={index} className="mb-4">
                                        <TextInput
                                            id={`male_sub_name_${index}`}
                                            name={`male_sub_name_${index}`}
                                            className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                            value={sub.name}
                                            placeholder="Enter Male Criteria Name"
                                            onChange={(e) => handleCriteriaChange(setMaleCriteria, maleCriteria, index, 'name', e.target.value)}
                                        />

                                        <InputLabel htmlFor={`male_weight_${index}`} value="Weight" />
                                        <TextInput
                                            id={`male_weight_${index}`}
                                            name={`male_weight_${index}`}
                                            type="number"
                                            className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                                            value={sub.weight}
                                            placeholder="Enter Male Criteria Weight"
                                            onChange={(e) => handleCriteriaChange(setMaleCriteria, maleCriteria, index, 'weight', e.target.value)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCriteria(setMaleCriteria, maleCriteria, index)}
                                            className="text-red-500 mt-2 hover:text-red-700 transition duration-200"
                                        >
                                            Remove Criteria
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleAddCriteria(setMaleCriteria, maleCriteria)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                                >
                                    Add Male Criteria
                                </button>
                            </div>

                          
                        </div>

                        {/* Form Actions */}
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

                {/* Close Button */}
                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                    ×
                </button>
            </div>

            {/* Custom Styled Alert */}
            {showAlert && (
                <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
                    <div className="bg-red-500 text-white p-6 rounded-lg w-[90%] max-w-md text-center">
                        <p className="text-xl">You can only add up to 4 criteria per segment.</p>
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

export default PairSegmentModal;