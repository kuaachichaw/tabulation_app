import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Candidate() {
    const [candidates, setCandidates] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isGridView, setIsGridView] = useState(false);

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

    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
    const closeFullscreen = () => setSelectedImage(null);

    return (
          <AuthenticatedLayout
                    header={<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Candidate List</h2>}
                >
            <Head title="Candidate List" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6">
                        <div className="flex justify-center mb-6">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsGridView(!isGridView)}
                                className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 transition-all"
                            >
                                {isGridView ? 'Switch to Carousel ->' : 'Switch to Grid View : :'}
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

            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <FullscreenImageModal
                    imageUrl={selectedImage}
                    onClose={closeFullscreen}
                />
            )}

            <ToastContainer />
        </AuthenticatedLayout>
    );
}
