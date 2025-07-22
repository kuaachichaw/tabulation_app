import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import RegisterModal from '@/Modal/RegisterModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { FaTrashAlt, FaPlus, FaEdit, FaSearch, FaUserTie } from 'react-icons/fa';
import { BiSolidUserDetail } from 'react-icons/bi';

export default function Ajudge() {
    const [judges, setJudges] = useState([]);
    const [filteredJudges, setFilteredJudges] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentJudge, setCurrentJudge] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const response = await axios.get('/api/judges');
                setJudges(response.data);
                setFilteredJudges(response.data);
            } catch (error) {
                toast.error('Failed to fetch judges');
                console.error('Error fetching judges:', error);
            }
        };
        fetchJudges();
    }, []);

    useEffect(() => {
        const results = judges.filter(judge =>
            judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            judge.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredJudges(results);
    }, [searchTerm, judges]);

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
            <div className="p-4">
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Are you sure you want to delete this judge?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => confirmDelete(judgeId, toastId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Confirm Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastId)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            { 
                autoClose: false,
                closeOnClick: false,
                className: 'w-full max-w-md'
            }
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
                    Judges Management
                </h2>
            }
        >
            <Head title="Admin Judge List" />

            <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-xl rounded-xl dark:bg-gray-800 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="w-full sm:w-auto">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    Judges Directory
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Manage all competition judges
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search judges..."
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={() => openModal()}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 ease-in-out shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <FaPlus size={16} /> Add New Judge
                                </button>
                            </div>
                        </div>

                        {filteredJudges.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredJudges.map((judge) => (
                                    <div key={judge.id} className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-600">
                                        <div className="flex flex-col items-center">
                                            {judge.picture ? (
                                                <div className="relative group">
                                                    <img
                                                        src={`/storage/${judge.picture}`}
                                                        alt={judge.name}
                                                        className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-white dark:border-gray-600 shadow-md cursor-pointer transform transition duration-300 ease-in-out group-hover:scale-105"
                                                        loading="lazy"
                                                        onClick={() => handleImageClick(`/storage/${judge.picture}`)}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <BiSolidUserDetail className="text-white text-2xl" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center shadow-md">
                                                    <FaUserTie className="text-gray-400 dark:text-gray-300 text-4xl" />
                                                </div>
                                            )}
                                            
                                            <div className="mt-4 text-center">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                    {judge.name}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                    @{judge.username}
                                                </p>
                                            </div>
                                            
                                            <div className="mt-5 flex justify-center space-x-3 w-full">
                                                <button
                                                    onClick={() => openModal(judge)}
                                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200 flex items-center gap-2 text-sm"
                                                >
                                                    <FaEdit size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(judge.id)}
                                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 flex items-center gap-2 text-sm"
                                                >
                                                    <FaTrashAlt size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FaUserTie className="text-gray-400 dark:text-gray-500 text-5xl mb-4" />
                                <h4 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    {searchTerm ? 'No matching judges found' : 'No judges available'}
                                </h4>
                                <p className="text-gray-400 dark:text-gray-500 text-center max-w-md">
                                    {searchTerm ? 'Try a different search term' : 'Click "Add New Judge" to create your first judge profile'}
                                </p>
                                {!searchTerm && (
                                    <button 
                                        onClick={() => openModal()}
                                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 flex items-center gap-2"
                                    >
                                        <FaPlus /> Add Judge
                                    </button>
                                )}
                            </div>
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

            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </AdminLayout>
    );
}