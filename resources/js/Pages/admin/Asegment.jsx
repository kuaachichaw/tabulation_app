import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import SegmentModal from '@/Modal/SegmentModal';
import PairSegmentModal from '@/Modal/PairSegmentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrashAlt, FaPlus, FaEdit } from 'react-icons/fa';
import { BiSolidUser } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";
import { 
    fetchSoloSegments, 
    fetchPairSegments, 
    deleteSegment 
} from '@/BackEnd/AsegmentBackEnd.jsx';

export default function Asegment() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPairModalOpen, setIsPairModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [soloSegments, setSoloSegments] = useState([]);
    const [pairSegments, setPairSegments] = useState([]);
    const [displayMode, setDisplayMode] = useState('solo');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadSegments();
    }, []);
    
    const loadSegments = async () => {
        setIsLoading(true);
        try {
            const [soloData, pairData] = await Promise.all([
                fetchSoloSegments(),
                fetchPairSegments()
            ]);
            setSoloSegments(soloData);
            setPairSegments(pairData);
        } catch (error) {
            console.error('Error loading segments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        loadSegments();
    };

    const openPairModal = () => setIsPairModalOpen(true);
    const closePairModal = () => {
        setIsPairModalOpen(false);
        loadSegments();
    };

    const openSelectionModal = () => setIsSelectionModalOpen(true);
    const closeSelectionModal = () => setIsSelectionModalOpen(false);

    const handleDeleteSegment = async (segmentId, isPair = false) => {
        if (window.confirm('Are you sure you want to delete this Segment?')) {
            setIsLoading(true);
            try {
                await deleteSegment(segmentId, isPair);
                loadSegments();
            } catch (error) {
                console.error('Error in handleDeleteSegment:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderSoloSegments = () => {
        if (isLoading) return <div className="text-center py-10 text-gray-500">Loading Segments...</div>;
        
        if (soloSegments.length === 0) {
            return <p className="text-gray-500 text-center">No Solo Segments available.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {soloSegments.map((segment) => (
                    <div key={segment.id} className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md transition-transform transform hover:scale-105">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                {segment.name}
                            </h4>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {segment.criteria?.map((criteria) => (
                                <li key={criteria.id} className="flex justify-between border-b pb-1">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {criteria.name}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {criteria.weight}%
                                    </span>
                                </li>
                            )) || <p className="text-gray-500">No criteria defined</p>}
                        </ul>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleDeleteSegment(segment.id, false)}
                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <FaTrashAlt size={16} /> {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPairSegments = () => {
        if (isLoading) return <div className="text-center py-10 text-gray-500">Loading Segments...</div>;
        
        if (pairSegments.length === 0) {
            return <p className="text-gray-500 text-center">No Pair Segments available.</p>;
        }
    
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pairSegments.map((pair) => {
                    const maleCriterias = pair.criterias?.filter(c => c?.type === 'male') || [];
                    const femaleCriterias = pair.criterias?.filter(c => c?.type === 'female') || [];
    
                    return (
                        <div key={pair.id} className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md transition-transform transform hover:scale-105">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 bg-gray-200 dark:bg-gray-600 p-2 rounded-lg text-center">
                                {pair.pair_name || 'Untitled Pair'}
                            </h2>
    
                            <div className="flex gap-4">
                                {/* Female Segment (Gown) */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                                            <HiUsers className="text-white text-xs" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {pair.female_name || 'Gown Attire'}
                                        </h4>
                                    </div>
                                    {femaleCriterias.length > 0 ? (
                                        <ul className="mt-2 space-y-2">
                                            {femaleCriterias.map((criteria) => (
                                                <li key={criteria.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-1">
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {criteria.criteria_name}
                                                    </span>
                                                    <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                        {criteria.weight}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-600 rounded text-center">
                                            <p className="text-gray-500 dark:text-gray-300 text-sm">No gown criteria defined</p>
                                        </div>
                                    )}
                                </div>
    
                                {/* Male Segment (Suit) */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                            <BiSolidUser className="text-white text-xs" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {pair.male_name || 'Suit Attire'}
                                        </h4>
                                    </div>
                                    {maleCriterias.length > 0 ? (
                                        <ul className="mt-2 space-y-2">
                                            {maleCriterias.map((criteria) => (
                                                <li key={criteria.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-1">
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {criteria.criteria_name}
                                                    </span>
                                                    <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                        {criteria.weight}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-600 rounded text-center">
                                            <p className="text-gray-500 dark:text-gray-300 text-sm">No suit criteria defined</p>
                                        </div>
                                    )}
                                </div>
                            </div>
    
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleDeleteSegment(pair.id, true)}
                                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    <FaTrashAlt size={16} /> {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Segments
                </h2>
            }
        >
            <Head title="Admin Segment" />
            <ToastContainer />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4 sm:mb-0">
                                Manage Segments
                            </h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setDisplayMode('solo')}
                                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                                        displayMode === 'solo'
                                            ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <BiSolidUser size={16} /> Solo Segments
                                </button>
                                <button
                                    onClick={() => setDisplayMode('pair')}
                                    className={`px-4 py-2 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 ${
                                        displayMode === 'pair'
                                            ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                                            : 'bg-gray-500 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    <HiUsers size={16} /> Pair Segments
                                </button>
                            </div>
                            <button
                                onClick={openSelectionModal}
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <FaPlus size={16} /> {isLoading ? 'Loading...' : 'Add Segment'}
                            </button>
                        </div>

                        {displayMode === 'solo' ? renderSoloSegments() : renderPairSegments()}
                    </div>
                </div>
            </div>

            <SegmentModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                mode="create"
            />

            <PairSegmentModal
                isOpen={isPairModalOpen}
                closeModal={closePairModal}
                mode="create"
            />

            {isSelectionModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full sm:w-96 max-w-md">
                        <h2 className="text-lg font-semibold text-white mb-4">What would you like to add?</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    closeSelectionModal();
                                    openModal();
                                }}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                            >
                                Add Solo Segment
                            </button>
                            <button
                                onClick={() => {
                                    closeSelectionModal();
                                    openPairModal();
                                }}
                                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                            >
                                Add Pair Segment
                            </button>
                            <button
                                onClick={closeSelectionModal}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}