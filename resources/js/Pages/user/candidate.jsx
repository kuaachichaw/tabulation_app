import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { motion } from 'framer-motion';


export default function candidate() {
    const [candidates, setCandidates] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Candidates</h2>}>
            <Head title="Candidate List" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 sm:mb-0">
                                 Candidates List
                            </h3>
                            
                        </div>

                        {/* Candidate Display */}
                        {candidates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {candidates.map((candidate) => (
                                    <motion.div
                                        key={candidate.id}
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 flex flex-col items-center"
                                    >
                                      
                                        <motion.img
                                            src={`/storage/${candidate.picture}`}
                                            alt={candidate.name}
                                             className="w-30 h-35 rounded-full object-cover border-4 border-white"
                                            loading="lazy"
                                            onClick={() => handleImageClick(`/storage/${candidate.picture}`)}
                                        />
                                        <h3 className="text-gray-500 dark:text-gray-300 text-center text-lg sm:text-xl mt-2">
                                            {candidate.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-300 text-center">Age: {candidate.age}</p>
                                        <p className="text-gray-500 dark:text-gray-300 text-center">Vital: {candidate.vital}</p>

                                     
                                    </motion.div>
                                ))}
                            </div>
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