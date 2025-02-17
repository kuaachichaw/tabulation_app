import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

const CandidateModal = ({ isOpen, closeModal, onSuccess, onFailure, candidate, mode = 'create' }) => {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: candidate?.name || '',
        age: candidate?.age || '',
        vital: candidate?.vital || '',
        picture: null,
    });

    const submit = (e) => {
        e.preventDefault();

        const url = mode === 'create' ? route('candidates.store') : route('candidates.update', candidate.id);
        const method = mode === 'create' ? post : put;

        method(url, {
            data: {
                name: data.name,
                age: data.age,
                vital: data.vital,
                picture: data.picture,
            },
            onFinish: () => reset(),
            onSuccess: () => {
                reset();
                onSuccess();
                closeModal();
            },
            onError: () => {
                onFailure();
            },
        });
    };

    const handleFileChange = (e) => {
        setData('picture', e.target.files[0]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity ease-in-out duration-300">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full sm:w-96 max-w-md transform transition-all duration-300 ease-in-out">
                <Head title={mode === 'create' ? "Add Candidate" : "Edit Candidate"} />

                {/* Display global error message if available */}
                {errors.global && (
                    <div className="text-red-500 text-sm mb-4">
                        {errors.global}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.name ? 'border-red-500' : 'border-gray-500'}`}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Enter full name"
                            />
                            <InputError message={errors.name} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Age Input */}
                        <div>
                            <InputLabel htmlFor="age" value="Age" />
                            <TextInput
                                id="age"
                                name="age"
                                type="number"
                                value={data.age}
                                className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.age ? 'border-red-500' : 'border-gray-500'}`}
                                onChange={(e) => setData('age', e.target.value)}
                                required
                                placeholder="Enter age"
                            />
                            <InputError message={errors.age} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Vital Input */}
                        <div>
                            <InputLabel htmlFor="vital" value="Vital" />
                            <TextInput
                                id="vital"
                                name="vital"
                                value={data.vital}
                                className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.vital ? 'border-red-500' : 'border-gray-500'}`}
                                onChange={(e) => setData('vital', e.target.value)}
                                required
                                placeholder="Enter vital"
                            />
                            <InputError message={errors.vital} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Picture Input */}
                        <div>
                            <InputLabel htmlFor="picture" value="Picture" />
                            <input
                                type="file"
                                id="picture"
                                name="picture"
                                onChange={handleFileChange}
                                className="mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                required={mode === 'create'}
                            />
                            <InputError message={errors.picture} className="mt-2 text-red-500 text-sm" />
                            
                            {/* Display picture preview */}
                            {data.picture && (
                                <div className="mt-4 flex justify-center">
                                    <img
                                        src={URL.createObjectURL(data.picture)}
                                        alt="Selected"
                                        className="w-32 h-32 object-cover rounded-md shadow-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-between">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-red-500 transition duration-200 transform hover:scale-105"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-2">
                                <PrimaryButton
                                    className="ms-4 px-6 py-2 text-lg transition-all transform hover:scale-105"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 animate-spin"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            </svg>
                                            Saving...
                                        </div>
                                    ) : mode === 'create' ? 'Add Candidate' : 'Update Candidate'}
                                </PrimaryButton>

                                {mode === 'edit' && (
                                    <button
                                        type="button"
                                        onClick={() => reset()}
                                        className="text-gray-400 hover:text-yellow-500 transition duration-200 transform hover:scale-105"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CandidateModal;
