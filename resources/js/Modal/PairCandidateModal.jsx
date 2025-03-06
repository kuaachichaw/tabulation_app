import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

const PairCandidateModal = ({ isOpen, closeModal, onSuccess, onFailure, mode = 'create' }) => {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        pair_name: '',
        female_name: '',
        female_age: '',
        female_vital: '',
        female_picture: null,
        male_name: '',
        male_age: '',
        male_vital: '',
        male_picture: null,
    });

    const submit = (e) => {
        e.preventDefault();

        const url = mode === 'create' ? route('pair-candidates.store') : route('pair-candidates.update', data.id);
        const method = mode === 'create' ? post : put;

        method(url, {
            data,
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

    const handleFileChange = (field, e) => {
        setData(field, e.target.files[0]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity ease-in-out duration-300">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full sm:w-3/4 max-w-4xl transform transition-all duration-300 ease-in-out">
                <Head title={mode === 'create' ? "Add Pair Candidate" : "Edit Pair Candidate"} />

                {/* Display global error message if available */}
                {errors.global && (
                    <div className="text-red-500 text-sm mb-4">
                        {errors.global}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="space-y-6">
                        {/* Pair Name Input */}
                        <div>
                            <InputLabel htmlFor="pair_name" value="Pair Name" />
                            <TextInput
                                id="pair_name"
                                name="pair_name"
                                value={data.pair_name}
                                className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.pair_name ? 'border-red-500' : 'border-gray-500'}`}
                                onChange={(e) => setData('pair_name', e.target.value)}
                                required
                                placeholder="Enter pair name"
                            />
                            <InputError message={errors.pair_name} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Female and Male Candidate Sections */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Female Candidate */}
                            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-white mb-4">Female Candidate</h3>

                                <div className="space-y-4">
                                    {/* Female Name */}
                                    <div>
                                        <InputLabel htmlFor="female_name" value="Name" />
                                        <TextInput
                                            id="female_name"
                                            name="female_name"
                                            value={data.female_name}
                                            className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.female_name ? 'border-red-500' : 'border-gray-500'}`}
                                            onChange={(e) => setData('female_name', e.target.value)}
                                            required
                                            placeholder="Enter female candidate's name"
                                        />
                                        <InputError message={errors.female_name} className="mt-2 text-red-500 text-sm" />
                                    </div>

                                    {/* Female Age */}
                                    <div>
                                        <InputLabel htmlFor="female_age" value="Age" />
                                        <TextInput
                                            id="female_age"
                                            name="female_age"
                                            type="number"
                                            value={data.female_age}
                                            className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.female_age ? 'border-red-500' : 'border-gray-500'}`}
                                            onChange={(e) => setData('female_age', e.target.value)}
                                            required
                                            placeholder="Enter female candidate's age"
                                        />
                                        <InputError message={errors.female_age} className="mt-2 text-red-500 text-sm" />
                                    </div>

                                    {/* Female Vital */}
                                    <div>
                                        <InputLabel htmlFor="female_vital" value="Vital" />
                                        <TextInput
                                            id="female_vital"
                                            name="female_vital"
                                            value={data.female_vital}
                                            className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.female_vital ? 'border-red-500' : 'border-gray-500'}`}
                                            onChange={(e) => setData('female_vital', e.target.value)}
                                            required
                                            placeholder="Enter female candidate's vital"
                                        />
                                        <InputError message={errors.female_vital} className="mt-2 text-red-500 text-sm" />
                                    </div>

                                    {/* Female Picture */}
                                    <div>
                                        <InputLabel htmlFor="female_picture" value="Picture" />
                                        <input
                                            type="file"
                                            id="female_picture"
                                            name="female_picture"
                                            onChange={(e) => handleFileChange('female_picture', e)}
                                            className="mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                            required={mode === 'create'}
                                        />
                                        <InputError message={errors.female_picture} className="mt-2 text-red-500 text-sm" />

                                        {/* Female Picture Preview */}
                                        {data.female_picture && (
                                            <div className="mt-4 flex justify-center">
                                                <img
                                                    src={URL.createObjectURL(data.female_picture)}
                                                    alt="Female Candidate"
                                                    className="w-32 h-32 object-cover rounded-md shadow-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Male Candidate */}
                            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-white mb-4">Male Candidate</h3>

                                <div className="space-y-4">
                                    {/* Male Name */}
                                    <div>
                                        <InputLabel htmlFor="male_name" value="Name" />
                                        <TextInput
                                            id="male_name"
                                            name="male_name"
                                            value={data.male_name}
                                            className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.male_name ? 'border-red-500' : 'border-gray-500'}`}
                                            onChange={(e) => setData('male_name', e.target.value)}
                                            required
                                            placeholder="Enter male candidate's name"
                                        />
                                        <InputError message={errors.male_name} className="mt-2 text-red-500 text-sm" />
                                    </div>

                                    {/* Male Age */}
                                    <div>
                                        <InputLabel htmlFor="male_age" value="Age" />
                                        <TextInput
                                            id="male_age"
                                            name="male_age"
                                            type="number"
                                            value={data.male_age}
                                            className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.male_age ? 'border-red-500' : 'border-gray-500'}`}
                                            onChange={(e) => setData('male_age', e.target.value)}
                                            required
                                            placeholder="Enter male candidate's age"
                                        />
                                        <InputError message={errors.male_age} className="mt-2 text-red-500 text-sm" />
                                    </div>

                                    {/* Male Vital */}
                                    <div>
                                        <InputLabel htmlFor="male_vital" value="Vital" />
                                        <TextInput
                                            id="male_vital"
                                            name="male_vital"
                                            value={data.male_vital}
                                            className={`mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white ${errors.male_vital ? 'border-red-500' : 'border-gray-500'}`}
                                            onChange={(e) => setData('male_vital', e.target.value)}
                                            required
                                            placeholder="Enter male candidate's vital"
                                        />
                                        <InputError message={errors.male_vital} className="mt-2 text-red-500 text-sm" />
                                    </div>

                                    {/* Male Picture */}
                                    <div>
                                        <InputLabel htmlFor="male_picture" value="Picture" />
                                        <input
                                            type="file"
                                            id="male_picture"
                                            name="male_picture"
                                            onChange={(e) => handleFileChange('male_picture', e)}
                                            className="mt-2 block w-full border rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                            required={mode === 'create'}
                                        />
                                        <InputError message={errors.male_picture} className="mt-2 text-red-500 text-sm" />

                                        {/* Male Picture Preview */}
                                        {data.male_picture && (
                                            <div className="mt-4 flex justify-center">
                                                <img
                                                    src={URL.createObjectURL(data.male_picture)}
                                                    alt="Male Candidate"
                                                    className="w-32 h-32 object-cover rounded-md shadow-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                                    ) : mode === 'create' ? 'Add Pair Candidate' : 'Update Pair Candidate'}
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

export default PairCandidateModal;