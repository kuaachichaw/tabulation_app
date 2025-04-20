import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

const RegisterModal = ({ isOpen, closeModal, onSuccess, onFailure, judge, mode = 'create' }) => {
    

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: judge?.name || '',
        username: judge?.username || '',
        password: '',
        picture: null,
    });

    const submit = (e) => {
        e.preventDefault();

        const url = mode === 'create' ? route('register') : route('judges.update', judge.id);
        const method = mode === 'create' ? post : put;

        let formData = new FormData();
        formData.append('name', data.name);
        formData.append('username', data.username);
        formData.append('password', data.password);
        if (data.picture) {
            formData.append('picture', data.picture);
        }

        method(url, {
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
            onFinish: () => reset('password'),
            onSuccess: () => {
                onSuccess();
                closeModal();
            },
            onError: () => {
                onFailure();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 transition-opacity ease-in-out duration-300">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full sm:w-96 max-w-md">
                <Head title={mode === 'create' ? "Register Judge" : "Edit Judge"} />

                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-2 block w-full border border-gray-500 rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Enter full name"
                            />
                            <InputError message={errors.name} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Username Input */}
                        <div>
                            <InputLabel htmlFor="username" value="Username" />
                            <TextInput
                                id="username"
                                name="username"
                                value={data.username}
                                className="mt-2 block w-full border border-gray-500 rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                placeholder="Enter username"
                            />
                            <InputError message={errors.username} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Password Input */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full border border-gray-500 rounded-md p-3 transition-all focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                onChange={(e) => setData('password', e.target.value)}
                                required={mode === 'create'}
                                placeholder="Enter password"
                            />
                            <InputError message={errors.password} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Picture Upload Input */}
                        <div>
                            <InputLabel htmlFor="picture" value="Profile Picture" />
                            <input
                                id="picture"
                                type="file"
                                name="picture"
                                accept="image/*"
                                className="mt-2 block w-full border border-gray-500 rounded-md p-3 bg-gray-700 text-white"
                                onChange={(e) => setData('picture', e.target.files[0])}
                            />
                            <InputError message={errors.picture} className="mt-2 text-red-500 text-sm" />
                        </div>

                        {/* Preview Uploaded Image */}
                        {data.picture && (
                            <div className="mt-4">
                                <p className="text-gray-400 text-sm">Preview:</p>
                                <img
                                    src={typeof data.picture === 'string' ? `/storage/${data.picture}` : URL.createObjectURL(data.picture)}
                                    alt="Judge Preview"
                                    className="mt-2 w-24 h-24 rounded-full object-cover border border-gray-500"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-between">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-red-500 transition duration-200"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <PrimaryButton className="ms-4" disabled={processing}>
                                {mode === 'create' ? 'Register' : 'Update'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
