import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import SegmentModal from '@/Modal/SegmentModal';
import PairSegmentModal from '@/Modal/PairSegmentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrashAlt, FaPlus, FaEdit, FaCrown, FaVenus, FaMars } from 'react-icons/fa';
import { BiSolidUser } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";
import { FaFemale } from "react-icons/fa";
import { FaMale } from "react-icons/fa";
import { 
    fetchSoloSegments, 
    fetchPairSegments, 
    deleteSegment 
} from '@/BackEnd/AsegmentBackEnd.jsx';

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
            toast.error('Failed to load segments');
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
                toast.success('Segment deleted successfully');
                loadSegments();
            } catch (error) {
                console.error('Error in handleDeleteSegment:', error);
                toast.error('Failed to delete segment');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderSoloSegments = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
        
        if (soloSegments.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                        <BiSolidUser className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">No Solo Segments</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new solo segment.</p>
                    <div className="mt-6">
                        <button
                            onClick={openModal}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaPlus className="mr-2" /> Create Solo Segment
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {soloSegments.map((segment) => (
                    <div key={segment.id} className="relative group p-5 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => handleDeleteSegment(segment.id, false)}
                                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                title="Delete segment"
                                disabled={isLoading}
                            >
                                <FaTrashAlt size={14} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${colors.secondary} flex items-center justify-center`}>
                                             <FaVenus className="h-5 w-5 text-white" />
                                        </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {segment.name}
                            </h4>
                        </div>
                        
                        <div className="space-y-3">
                            {segment.criteria?.length > 0 ? (
                                segment.criteria.map((criteria) => (
                                    <div key={criteria.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {criteria.name}
                                        </span>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                            {criteria.weight}%
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No criteria defined
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {segment.criteria?.length || 0} criteria
                            </span>
                            <button
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                onClick={() => {
                                    // Add edit functionality here
                                }}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPairSegments = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
        
        if (pairSegments.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                        <HiUsers className="w-full h-full" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">No Pair Segments</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new pair segment.</p>
                    <div className="mt-6">
                        <button
                            onClick={openPairModal}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaPlus className="mr-2" /> Create Pair Segment
                        </button>
                    </div>
                </div>
            );
        }
    
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pairSegments.map((pair) => {
                    const maleCriterias = pair.criterias?.filter(c => c?.type === 'male') || [];
                    const femaleCriterias = pair.criterias?.filter(c => c?.type === 'female') || [];
    
                    return (
                        <div key={pair.id} className="relative group p-5 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleDeleteSegment(pair.id, true)}
                                    className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                    title="Delete segment"
                                    disabled={isLoading}
                                >
                                    <FaTrashAlt size={14} />
                                </button>
                            </div>
                            
                            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                                {pair.pair_name || 'Untitled Pair'}
                            </h2>
    
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Female Segment */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${colors.secondary} flex items-center justify-center`}>
                                             <FaVenus className="h-5 w-5 text-white" />
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {pair.female_name || 'Gown Attire'}
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {femaleCriterias.length > 0 ? (
                                            femaleCriterias.map((criteria) => (
                                                <div key={criteria.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                        {criteria.criteria_name}
                                                    </span>
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                                                        {criteria.weight}%
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                No gown criteria defined
                                            </div>
                                        )}
                                    </div>
                                </div>
    
                                {/* Male Segment */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${colors.primary} flex items-center justify-center`}>
                                        <FaMars className="h-5 w-5 text-white" />
                                        </div>

                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {pair.male_name || 'Suit Attire'}
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {maleCriterias.length > 0 ? (
                                            maleCriterias.map((criteria) => (
                                                <div key={criteria.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                        {criteria.criteria_name}
                                                    </span>
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                        {criteria.weight}%
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                No suit criteria defined
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {femaleCriterias.length + maleCriterias.length} total criteria
                                </span>
                                <button
                                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                    onClick={() => {
                                        // Add edit functionality here
                                    }}
                                >
                                    Edit
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
                 <h2 className="text-xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                    Segments
                </h2>
            }
        >
            <Head title="Admin Segment" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow rounded-xl">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                        Segment Management
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {displayMode === 'solo' ? 
                                            "Manage individual performance segments" : 
                                            "Manage paired performance segments"}
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
 <FaPlus className="mr-2" /> Add Segments
 </button>
                                </div>
                            </div>

                            {displayMode === 'solo' ? renderSoloSegments() : renderPairSegments()}
                        </div>
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
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Create New Segment
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
                                            <h4 className="font-medium text-gray-900 dark:text-white">Solo Segment</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">For individual performances</p>
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
                                            <h4 className="font-medium text-gray-900 dark:text-white">Pair Segment</h4>
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
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}