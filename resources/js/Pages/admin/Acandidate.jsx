import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import CandidateModal from '@/Modal/CandidateModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaTrashAlt, FaPlus, FaEdit } from 'react-icons/fa';
import FlexContainer from '@/Components/FlexContainer';

export default function Acandidate() {
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isGridView, setIsGridView] = useState(false); // View toggle state

    // Fetch candidates using axios
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get('/api/candidates');
                setCandidates(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch candidates');
            }
        };
        fetchCandidates();
    }, []);

    const openModal = useCallback((candidate = null) => {
        setCurrentCandidate(candidate);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setCurrentCandidate(null);
        setIsModalOpen(false);
    }, []);

    const handleDelete = (candidateId) => {
        const toastId = toast.warn(
            <div>
                <p>Are you sure you want to delete this candidate?</p>
                <div className="flex justify-end space-x-2 mt-2">
                    <button
                        onClick={() => confirmDelete(candidateId, toastId)}
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

    const confirmDelete = async (candidateId, toastId) => {
        try {
            await axios.delete(`/api/candidates/${candidateId}`);
            setCandidates(prevCandidates => prevCandidates.filter(candidate => candidate.id !== candidateId));
            toast.dismiss(toastId);
            toast.success('Candidate deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete candidate');
        }
    };

    const handleSuccess = (message = 'Candidate added successfully') => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get('/api/candidates');
                setCandidates(response.data);
                toast.success(message);
                closeModal(); // Close modal after success
            } catch (error) {
                toast.error('Failed to fetch candidates');
                console.error('Error fetching candidates:', error);
            }
        };
        fetchCandidates();
    };
    

    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
    const closeFullscreen = () => setSelectedImage(null);

    return (
        
            <AdminLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Canidates</h2>}>
            <Head title="Admin Candidate List" />
          

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Manage Canididates</h3>
                            <button 
                                 onClick={() => openModal()}
                                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md"
                            >
                                + Add Candidate
                            </button>
                        </div>


                        <div className="flex justify-center mb-6">
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsGridView(!isGridView)}
        className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 transition-all"
    >
        {isGridView ? 'Carousel View' : 'Grid View'}
    </motion.button>
</div>


                        {/* Candidate Display */}
                        {candidates.length > 0 ? (
                            isGridView ? (
                                // Grid View
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {candidates.map((candidate) => (
                                        <motion.div
                                            key={candidate.id}
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 flex flex-col items-center"
                                        >
                                            <motion.img
                                                src={`/storage/${candidate.picture}`}
                                                alt={candidate.name}
                                                className="w-120 h-120 object-cover rounded-md cursor-pointer hover:scale-110 transition-all"
                                                loading="lazy"
                                                onClick={() => handleImageClick(`/storage/${candidate.picture}`)}
                                            />
                                            <h3 className="text-gray-500 dark:text-gray-300 text-center text-xl mt-2">
                                                {candidate.name}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-300 text-center">Age: {candidate.age}</p>
                                            <p className="text-gray-500 dark:text-gray-300 text-center">Vital: {candidate.vital}</p>



                                            <div className="mt-4 flex justify-center space-x-4">
                                            {/* Updated: Update button with FaEdit icon */}
                                            <button
                                                className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center gap-2"
                                                onClick={() => openModal(candidate)}
                                            >
                                                <FaEdit size={16} /> Update
                                            </button>
                                            {/* Updated: Delete button remains with FaTrashAlt icon */}
                                            <button
                                                className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center gap-2"
                                                onClick={() => handleDelete(candidate.id)}
                                            >
                                                <FaTrashAlt size={16} /> Delete
                                            </button>
                                        </div>

                                        
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                // Carousel View (Swiper)
                                <Swiper
                                    modules={[Navigation, Pagination, Autoplay]}
                                    spaceBetween={30}
                                    slidesPerView={1}
                                    navigation
                                    pagination={{ clickable: true }}
                                    autoplay={{ delay: 1000 }}
                                    breakpoints={{
                                        640: { slidesPerView: 1 },
                                        768: { slidesPerView: 2 },
                                        1024: { slidesPerView: 3 },
                                    }}
                                    className="p-4"
                                >
                                    {candidates.map((candidate) => (
                                        <SwiperSlide key={candidate.id}>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="bg-gray-900 p-4 rounded-lg shadow-md dark:bg-gray-800 flex flex-col items-center"
                                            >
                                                <img
                                                    src={`/storage/${candidate.picture}`}
                                                    alt={candidate.name}
                                                    className="w-120 h-120 object-cover rounded-md cursor-pointer hover:scale-110 transition-all"
                                                    onClick={() => handleImageClick(`/storage/${candidate.picture}`)}
                                                />
                                                <h3 className="text-white text-center text-xl mt-2 font-bold">
                                                    {candidate.name}
                                                </h3>
                                                <p className="text-gray-400 text-center">Age: {candidate.age}</p>
                                                <p className="text-gray-400 text-center">Vital: {candidate.vital}</p>
                                              
                                            </motion.div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )
                        ) : (
                            <p className="text-gray-500 dark:text-gray-300 text-center p-4">No candidates found.</p>
                        )}
                    </div>
                </div>
            </div>

                {/* Candidate Modal */}
            <CandidateModal
    key={currentCandidate ? currentCandidate.id : 'create'}
    isOpen={isModalOpen}
    closeModal={closeModal}
    onSuccess={() => handleSuccess(currentCandidate ? 'Candidate updated successfully' : 'Candidate added successfully')}
    onFailure={() => toast.error('Failed to update candidate')}
    candidate={currentCandidate}
    mode={currentCandidate ? 'edit' : 'create'}
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