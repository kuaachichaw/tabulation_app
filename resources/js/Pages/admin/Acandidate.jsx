import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import CandidateModal from '@/Modal/CandidateModal';
import PairCandidateModal from '@/Modal/PairCandidateModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullscreenImageModal from '@/Modal/FullscreenImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrashAlt, FaPlus, FaEdit, FaCrown, FaVenus, FaMars } from 'react-icons/fa';
import { BiSolidUser } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";

// Color palette
const colors = {
  primary: 'bg-gradient-to-r from-purple-600 to-indigo-600',
  secondary: 'bg-gradient-to-r from-pink-500 to-rose-500',
  accent: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  danger: 'bg-gradient-to-r from-red-500 to-rose-500',
  info: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  dark: 'bg-gradient-to-r from-gray-800 to-gray-900',
};

export default function Acandidate() {
    const [candidates, setCandidates] = useState([]);
    const [pairCandidates, setPairCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPairModalOpen, setIsPairModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [displayMode, setDisplayMode] = useState('solo');
    const [isLoading, setIsLoading] = useState(false);

    const fetchCandidates = useCallback(async () => {
        setIsLoading(true);
        try {
            const [soloResponse, pairResponse] = await Promise.all([
                axios.get('/api/candidates'),
                axios.get('/api/pair-candidates')
            ]);
            setCandidates(soloResponse.data);
            setPairCandidates(pairResponse.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch candidates');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const openModal = useCallback((candidate = null) => {
        setCurrentCandidate(candidate);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setCurrentCandidate(null);
        setIsModalOpen(false);
    }, []);

    const openPairModal = useCallback((pair = null) => {
        setCurrentCandidate(pair);
        setIsPairModalOpen(true);
    }, []);

    const closePairModal = useCallback(() => {
        setCurrentCandidate(null);
        setIsPairModalOpen(false);
    }, []);

    const openSelectionModal = useCallback(() => {
        setIsSelectionModalOpen(true);
    }, []);

    const closeSelectionModal = useCallback(() => {
        setIsSelectionModalOpen(false);
    }, []);

    const handleDelete = async (candidateId, isPair = false) => {
        const toastId = toast.warn(
            <div className="p-3">
                <p className="text-gray-800 dark:text-gray-200">Are you sure you want to delete this candidate?</p>
                <div className="flex justify-end space-x-2 mt-3">
                    <button
                        onClick={() => {
                            confirmDelete(candidateId, isPair);
                            toast.dismiss(toastId);
                        }}
                        className={`px-3 py-1 text-sm ${colors.danger} text-white rounded-md`}
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => toast.dismiss(toastId)}
                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            { autoClose: false, closeOnClick: false, closeButton: false }
        );
    };

    const confirmDelete = async (candidateId, isPair) => {
        try {
            await axios.delete(`/api/${isPair ? 'pair-candidates' : 'candidates'}/${candidateId}`);
            if (isPair) {
                setPairCandidates(prev => prev.filter(c => c.id !== candidateId));
            } else {
                setCandidates(prev => prev.filter(c => c.id !== candidateId));
            }
            toast.success('Candidate deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete candidate');
        }
    };

    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
    const closeFullscreen = () => setSelectedImage(null);

    const renderSoloCandidates = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center py-12">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.replace('bg-gradient-to-r', 'border')}`}></div>
            </div>
        );

        if (candidates.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-indigo-300">
                        <BiSolidUser className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-indigo-600 dark:text-indigo-300">No Solo Candidates</h3>
                    <p className="mt-1 text-indigo-400 dark:text-indigo-200">Get started by adding a new candidate.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                closeSelectionModal();
                                openModal();
                            }}
                            className={`inline-flex items-center px-4 py-2 ${colors.primary} text-white rounded-md font-semibold hover:shadow-lg transition-all`}
                        >
                            <FaPlus className="mr-2" /> Add Solo Candidate
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                    <motion.div
                        key={candidate.id}
                        whileHover={{ y: -5 }}
                        className={`relative group p-5 rounded-xl ${candidate.is_winner ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border-2 border-amber-300 dark:border-amber-500' : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600'} shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                        {candidate.is_winner && (
                            <div className="absolute -top-3 -right-3 z-10">
                                <div className={`${colors.accent} text-white p-2 rounded-full shadow-lg`}>
                                    <FaCrown size={16} />
                                </div>
                            </div>
                        )}
                        
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                            <button
                                onClick={() => openModal(candidate)}
                                className={`p-2 ${colors.info} text-white rounded-full shadow hover:shadow-md transition-all`}
                                title="Edit candidate"
                            >
                                <FaEdit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(candidate.id, false)}
                                className={`p-2 ${colors.danger} text-white rounded-full shadow hover:shadow-md transition-all`}
                                title="Delete candidate"
                            >
                                <FaTrashAlt size={14} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <motion.div 
                                className="relative"
                                whileHover={{ scale: 1.05 }}
                            >
                                <img
                                    src={`/storage/${candidate.picture}`}
                                    alt={candidate.name}
                                    className="w-52 h-62 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md cursor-pointer"
                                    loading="lazy"
                                    onClick={() => handleImageClick(`/storage/${candidate.picture}`)}
                                />
                                <div className={`absolute -bottom-2 -right-2 ${candidate.gender !== 'male' ? colors.secondary : colors.primary} text-white p-2 rounded-full shadow`}>
                                    {candidate.gender !== 'male' ? <FaVenus size={12} /> : <FaMars size={12} />}
                                </div>
                            </motion.div>
                            
                            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white text-center">
                                {candidate.name}
                            </h3>
                            <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                                <div className={`${colors.info.replace('bg-gradient-to-r', 'bg')} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center`}>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">Age</p>
                                    <p className="font-medium text-blue-800 dark:text-blue-200">{candidate.age}</p>
                                </div>
                                <div className={`${colors.success.replace('bg-gradient-to-r', 'bg')} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center`}>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-300">Vital</p>
                                    <p className="font-medium text-emerald-800 dark:text-emerald-200">{candidate.vital}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderPairCandidates = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center py-12">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.secondary.replace('bg-gradient-to-r', 'border')}`}></div>
            </div>
        );

        if (pairCandidates.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-pink-300">
                        <HiUsers className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-pink-600 dark:text-pink-300">No Pair Candidates</h3>
                    <p className="mt-1 text-pink-400 dark:text-pink-200">Get started by adding a new pair.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                closeSelectionModal();
                                openPairModal();
                            }}
                            className={`inline-flex items-center px-4 py-2 ${colors.secondary} text-white rounded-md font-semibold hover:shadow-lg transition-all`}
                        >
                            <FaPlus className="mr-2" /> Add Pair Candidate
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pairCandidates.map((pair) => (
                    <motion.div
                        key={pair.id}
                        whileHover={{ y: -5 }}
                        className={`relative group p-5 rounded-xl ${pair.is_winner ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 border-2 border-amber-300 dark:border-amber-500' : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600'} shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                        {pair.is_winner && (
                            <div className="absolute -top-3 -right-3 z-10">
                                <div className={`${colors.accent} text-white p-2 rounded-full shadow-lg`}>
                                    <FaCrown size={16} />
                                </div>
                            </div>
                        )}

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                            <button
                                onClick={() => openPairModal(pair)}
                                className={`p-2 ${colors.info} text-white rounded-full shadow hover:shadow-md transition-all`}
                                title="Edit pair"
                            >
                                <FaEdit size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(pair.id, true)}
                                className={`p-2 ${colors.danger} text-white rounded-full shadow hover:shadow-md transition-all`}
                                title="Delete pair"
                            >
                                <FaTrashAlt size={14} />
                            </button>
                        </div>
                        
                        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                            {pair.pair_name || 'Untitled Pair'}
                        </h2>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Female Candidate */}
                            <div className="flex-1 flex flex-col items-center">
                                <motion.div 
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={`/storage/${pair.female_picture}`}
                                        alt={pair.female_name}
                                        className="w-52 h-62 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md cursor-pointer"
                                        loading="lazy"
                                        onClick={() => handleImageClick(`/storage/${pair.female_picture}`)}
                                    />
                                    <div className={`absolute -bottom-2 -right-2 ${colors.secondary} text-white p-2 rounded-full shadow`}>
                                        <FaVenus size={12} />
                                    </div>
                                </motion.div>
                                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                                    {pair.female_name}
                                </h3>
                                <div className="mt-2 grid grid-cols-2 gap-2 w-full">
                                    <div className={`${colors.info.replace('bg-gradient-to-r', 'bg')} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center`}>
                                        <p className="text-xs text-blue-600 dark:text-blue-300">Age</p>
                                        <p className="font-medium text-blue-800 dark:text-blue-200">{pair.female_age}</p>
                                    </div>
                                    <div className={`${colors.success.replace('bg-gradient-to-r', 'bg')} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center`}>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-300">Vital</p>
                                        <p className="font-medium text-emerald-800 dark:text-emerald-200">{pair.female_vital}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Male Candidate */}
                            <div className="flex-1 flex flex-col items-center">
                                <motion.div 
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={`/storage/${pair.male_picture}`}
                                        alt={pair.male_name}
                                        className="w-52 h-62 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md cursor-pointer"
                                        loading="lazy"
                                        onClick={() => handleImageClick(`/storage/${pair.male_picture}`)}
                                    />
                                    <div className={`absolute -bottom-2 -right-2 ${colors.primary} text-white p-2 rounded-full shadow`}>
                                        <FaMars size={12} />
                                    </div>
                                </motion.div>
                                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                                    {pair.male_name}
                                </h3>
                                <div className="mt-2 grid grid-cols-2 gap-2 w-full">
                                    <div className={`${colors.info.replace('bg-gradient-to-r', 'bg')} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center`}>
                                        <p className="text-xs text-blue-600 dark:text-blue-300">Age</p>
                                        <p className="font-medium text-blue-800 dark:text-blue-200">{pair.male_age}</p>
                                    </div>
                                    <div className={`${colors.success.replace('bg-gradient-to-r', 'bg')} bg-opacity-10 dark:bg-opacity-20 p-2 rounded-lg text-center`}>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-300">Vital</p>
                                        <p className="font-medium text-emerald-800 dark:text-emerald-200">{pair.male_vital}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                    Candidates
                </h2>
            }
        >
            <Head title="Admin Candidate List" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className={`overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg rounded-xl border border-gray-200 dark:border-gray-600`}>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                        Candidate Management
                                    </h3>
                                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {displayMode === 'solo' ? 
                                            " Manage individual candidates" : 
                                            " Manage paired candidates"}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="inline-flex rounded-md shadow-sm bg-white dark:bg-gray-700 p-1">
                                        <button
                                            onClick={() => setDisplayMode('solo')}
                                            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-all duration-200 ${
                                                displayMode === 'solo'
                                                    ? `${colors.primary} text-white shadow-md`
                                                    : 'text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <BiSolidUser size={16} /> Solo
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setDisplayMode('pair')}
                                            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-all duration-200 ${
                                                displayMode === 'pair'
                                                    ? `${colors.secondary} text-white shadow-md`
                                                    : 'text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <HiUsers size={16} /> Pair
                                            </span>
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={openSelectionModal}
                                        className={`inline-flex items-center px-4 py-2 ${colors.primary} text-white text-sm font-medium rounded-md shadow hover:shadow-lg transition-all`}
                                        disabled={isLoading}
                                    >
                                        <FaPlus className="mr-2" /> Add Candidate
                                    </button>
                                </div>
                            </div>

                            {displayMode === 'solo' ? renderSoloCandidates() : renderPairCandidates()}
                        </div>
                    </div>
                </div>
            </div>

            <CandidateModal
                key={currentCandidate ? currentCandidate.id : 'create'}
                isOpen={isModalOpen}
                closeModal={closeModal}
                onSuccess={() => {
                    fetchCandidates();
                    toast.success(currentCandidate ? 'Candidate updated successfully' : 'Candidate added successfully');
                    closeModal();
                }}
                onFailure={() => toast.error('Failed to update candidate')}
                candidate={currentCandidate}
                mode={currentCandidate ? 'edit' : 'create'}
            />

            <PairCandidateModal
                key={currentCandidate ? currentCandidate.id : 'create-pair'}
                isOpen={isPairModalOpen}
                closeModal={closePairModal}
                onSuccess={() => {
                    fetchCandidates();
                    toast.success(currentCandidate ? 'Pair updated successfully' : 'Pair added successfully');
                    closePairModal();
                }}
                onFailure={() => toast.error('Failed to update pair')}
                pair={currentCandidate}
                mode={currentCandidate ? 'edit' : 'create'}
            />

            <AnimatePresence>
                {isSelectionModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Create New Candidate
                                </h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            closeSelectionModal();
                                            openModal();
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-3">
                                                <BiSolidUser className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium text-gray-900 dark:text-white">Solo Candidate</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Individual performer</p>
                                            </div>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            closeSelectionModal();
                                            openPairModal();
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-3">
                                                <HiUsers className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium text-gray-900 dark:text-white">Pair Candidates</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">For paired performances</p>
                                            </div>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
                                <button
                                    onClick={closeSelectionModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedImage && (
                <FullscreenImageModal
                    imageUrl={selectedImage}
                    onClose={closeFullscreen}
                />
            )}
        </AdminLayout>
    );
}