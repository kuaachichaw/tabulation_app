import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import RegisterModal from '@/Modal/RegisterModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { FaTrashAlt, FaPlus, FaEdit } from 'react-icons/fa';

export default function Ajudge() {
    const [judges, setJudges] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentJudge, setCurrentJudge] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const response = await axios.get('/api/judges');
                setJudges(response.data);
            } catch (error) {
                toast.error('Failed to fetch judges');
                console.error('Error fetching judges:', error);
            }
        };
        fetchJudges();
    }, []);

    const openModal = useCallback((judge = null) => {
        setCurrentJudge(judge);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setCurrentJudge(null);
        setIsModalOpen(false);
    }, []);

    const handleDelete = (judgeId) => {
        const toastId = toast.warn(
            <div>
                <p>Are you sure you want to delete this judge?</p>
                <div className="flex justify-end space-x-2 mt-2">
                    <button
                        onClick={() => confirmDelete(judgeId, toastId)}
                        className="px-2 py-1 bg-red-500 text-white rounded-lg"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastId)}
                        className="px-2 py-1 bg-gray-500 text-white rounded-lg"
                    >
                        No
                    </button>
                </div>
            </div>,
            { autoClose: false, closeOnClick: false }
        );
    };

    const confirmDelete = async (judgeId, toastId) => {
        try {
            await axios.delete(`/api/judges/${judgeId}`);
            setJudges(prevJudges => prevJudges.filter(judge => judge.id !== judgeId));
            toast.dismiss(toastId);
            toast.success('Judge deleted successfully');
        } catch (error) {
            toast.error('Failed to delete judge');
            console.error('Error deleting judge:', error);
        }
    };

    const handleSuccess = (message = 'Judge added successfully') => {
        const fetchJudges = async () => {
            try {
                const response = await axios.get('/api/judges');
                setJudges(response.data);
                toast.success(message);
                closeModal();
            } catch (error) {
                toast.error('Failed to fetch judges');
                console.error('Error fetching judges:', error);
            }
        };
        fetchJudges();
    };

    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
    const closeFullscreen = () => setSelectedImage(null);

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Judges 
                </h2>
            }
        >
            <Head title="Admin Judge List" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 sm:mb-0">
                                Manage Judges
                            </h3>
                            <button 
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                            >
                                <FaPlus size={16} /> Add Judge
                            </button>
                        </div>

                        {judges.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {judges.map((judge) => (
                                    <div key={judge.id} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 flex flex-col items-center">
                                        {judge.picture && (
                                            <img
                                                src={`/storage/${judge.picture}`}
                                                alt={judge.name}
                                                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-md cursor-pointer transform transition duration-300 ease-in-out hover:scale-110"
                                                loading="lazy"
                                                onClick={() => handleImageClick(`/storage/${judge.picture}`)}
                                            />
                                        )}
                                        <h3 className="text-gray-500 dark:text-gray-300 text-center text-lg sm:text-xl mt-4">
                                            {judge.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-300 text-center text-sm sm:text-base">
                                            Username: {judge.username}
                                        </p>
                                        <div className="mt-4 flex justify-center space-x-4">
                                            <button
                                                className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center gap-2"
                                                onClick={() => openModal(judge)}
                                            >
                                                <FaEdit size={16} /> Update
                                            </button>
                                            <button
                                                className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center gap-2"
                                                onClick={() => handleDelete(judge.id)}
                                            >
                                                <FaTrashAlt size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-300 text-center p-4">
                                No judges found.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Register Modal */}
            <RegisterModal
                key={currentJudge ? currentJudge.id : 'create'}
                isOpen={isModalOpen}
                closeModal={closeModal}
                onSuccess={() => handleSuccess(currentJudge ? 'Judge updated successfully' : 'Judge added successfully')}
                judge={currentJudge}
                mode={currentJudge ? 'edit' : 'create'}
            />

            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <FullscreenImageModal
                    imageUrl={selectedImage}
                    onClose={closeFullscreen}
                />
            )}

            <ToastContainer />
        </AdminLayout>
    );
}