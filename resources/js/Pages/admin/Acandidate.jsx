import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import CandidateModal from '@/Modal/CandidateModal';
import PairCandidateModal from '@/Modal/PairCandidateModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { motion } from 'framer-motion';
import { FaTrashAlt, FaPlus, FaEdit } from 'react-icons/fa';
import { BiSolidUser } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";

export default function Acandidate() {
    const [candidates, setCandidates] = useState([]);
    const [pairCandidates, setPairCandidates] = useState([]); // New state for pair candidates
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPairModalOpen, setIsPairModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [displayMode, setDisplayMode] = useState('solo'); // New state for display mode

    // Fetch solo candidates using axios
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

    // Fetch pair candidates using axios
    useEffect(() => {
        const fetchPairCandidates = async () => {
            try {
                const response = await axios.get('/api/pair-candidates');
                setPairCandidates(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch pair candidates');
            }
        };
        fetchPairCandidates();
    }, []);

    const openModal = useCallback((candidate = null) => {
        setCurrentCandidate(candidate);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setCurrentCandidate(null);
        setIsModalOpen(false);
    }, []);

    const openPairModal = useCallback(() => {
        setIsPairModalOpen(true);
    }, []);

    const closePairModal = useCallback(() => {
        setIsPairModalOpen(false);
    }, []);

    const openSelectionModal = useCallback(() => {
        setIsSelectionModalOpen(true);
    }, []);

    const closeSelectionModal = useCallback(() => {
        setIsSelectionModalOpen(false);
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

    const handlePairSuccess = (message = 'Pair candidate added successfully') => {
        const fetchPairCandidates = async () => {
            try {
                const response = await axios.get('/api/pair-candidates');
                setPairCandidates(response.data);
                toast.success(message);
                closePairModal(); // Close pair modal after success
            } catch (error) {
                toast.error('Failed to fetch pair candidates');
                console.error('Error fetching pair candidates:', error);
            }
        };
        fetchPairCandidates();
    };

    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
    const closeFullscreen = () => setSelectedImage(null);

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Candidates</h2>}>
            <Head title="Admin Candidate List" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 sm:mb-0">
                                Manage Candidates
                            </h3>

                            {/* Display Mode Toggle */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setDisplayMode('solo')}
                                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                                        displayMode === 'solo'
                                            ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <BiSolidUser   size={16} /> Solo Candidates
                                </button>
                                <button
                                    onClick={() => setDisplayMode('pair')}
                                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                                        displayMode === 'pair'
                                            ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <HiUsers  size={16} /> Pair Candidates
                                </button>
                            </div>

                            <button 
                                onClick={openSelectionModal} // Open selection modal
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                            >
                                <FaPlus size={16} /> Add Candidate
                            </button>
                        </div>

                        {/* Candidate Display */}
                        {displayMode === 'solo' ? (
                            candidates.length > 0 ? (
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

                                            <div className="mt-4 flex justify-center space-x-4">
                                                <button
                                                    className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center gap-2"
                                                    onClick={() => openModal(candidate)}
                                                >
                                                    <FaEdit size={16} /> Update
                                                </button>
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
                                <p className="text-gray-500 dark:text-gray-300 text-center p-4">No solo candidates found.</p>
                            )
                        ) : (
                            pairCandidates.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pairCandidates.map((pair) => (
                                        <motion.div
                                            key={pair.id}
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 flex flex-col items-center"
                                        >
                                                      {/* Pair Name */}
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                                                             {pair.pair_name}
                                                </h2>                              
                                                <div className="flex gap-4">
                                                {/* Female Candidate */}
                                                <div className="flex flex-col items-center">
                                                    <motion.img
                                                        src={`/storage/${pair.female_picture}`}
                                                        alt={pair.female_name}
                                                        className="w-30 h-35 rounded-full object-cover border-4 border-white"
                                                        loading="lazy"
                                                        onClick={() => handleImageClick(`/storage/${pair.female_picture}`)}
                                                    />
                                                    <h3 className="text-gray-500 dark:text-gray-300 text-center text-lg sm:text-xl mt-2">
                                                        {pair.female_name}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-300 text-center">Age: {pair.female_age}</p>
                                                    <p className="text-gray-500 dark:text-gray-300 text-center">Vital: {pair.female_vital}</p>
                                                </div>

                                                {/* Male Candidate */}
                                                <div className="flex flex-col items-center">
                                                    <motion.img
                                                        src={`/storage/${pair.male_picture}`}
                                                        alt={pair.male_name}
                                                        className="w-30 h-35 rounded-full object-cover border-4 border-white"
                                                        loading="lazy"
                                                        onClick={() => handleImageClick(`/storage/${pair.male_picture}`)}
                                                    />
                                                    <h3 className="text-gray-500 dark:text-gray-300 text-center text-lg sm:text-xl mt-2">
                                                        {pair.male_name}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-300 text-center">Age: {pair.male_age}</p>
                                                    <p className="text-gray-500 dark:text-gray-300 text-center">Vital: {pair.male_vital}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-center space-x-4">
                                                <button
                                                    className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center gap-2"
                                                    onClick={() => openPairModal(pair)}
                                                >
                                                    <FaEdit size={16} /> Update
                                                </button>
                                                <button
                                                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center gap-2"
                                                    onClick={() => handleDelete(pair.id)}
                                                >
                                                    <FaTrashAlt size={16} /> Delete
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-300 text-center p-4">No pair candidates found.</p>
                            )
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

            {/* Pair Candidate Modal */}
            <PairCandidateModal
                isOpen={isPairModalOpen}
                closeModal={closePairModal}
                onSuccess={() => handlePairSuccess('Pair candidate added successfully')}
                onFailure={() => toast.error('Failed to add pair candidate')}
                mode="create"
            />

            {/* Selection Modal */}
            {isSelectionModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full sm:w-96 max-w-md">
                        <h2 className="text-lg font-semibold text-white mb-4">What would you like to add?</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    closeSelectionModal();
                                    openModal(); // Open CandidateModal for solo candidate
                                }}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                            >
                                Add Solo Candidate
                            </button>
                            <button
                                onClick={() => {
                                    closeSelectionModal();
                                    openPairModal(); // Open PairCandidateModal for pair candidate
                                }}
                                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                            >
                                Add Pair Candidate
                            </button>
                            <button
                                onClick={closeSelectionModal} // Close the selection modal
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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