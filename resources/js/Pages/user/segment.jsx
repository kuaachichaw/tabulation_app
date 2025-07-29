import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaVenus, FaMars } from 'react-icons/fa';
import { BiSolidUser } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";
import { 
    fetchSoloSegments, 
    fetchPairSegments, 
} from '@/BackEnd/AsegmentBackEnd.jsx';
import axios from 'axios';

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
    const [soloSegments, setSoloSegments] = useState([]);
    const [pairSegments, setPairSegments] = useState([]);
    const [displayMode, setDisplayMode] = useState('solo');
    const [displayOption, setDisplayOption] = useState(0); // 0: Individual, 1: Pair, 2: Both
    const [isLoading, setIsLoading] = useState(false);

    // Fetch display option from backend
    useEffect(() => {
        axios.get('/display/get')
            .then(response => {
                setDisplayOption(response.data.Display_Segment);
            })
            .catch(error => {
                console.error('Error fetching display option:', error);
            });
    }, []);

    useEffect(() => {
        loadSegments();
    }, [displayOption]);
    
    const loadSegments = async () => {
        setIsLoading(true);
        try {
            const [soloData, pairData] = await Promise.all([
                fetchSoloSegments(),
                displayOption !== 0 ? fetchPairSegments() : Promise.resolve([])
            ]);
            setSoloSegments(soloData);
            setPairSegments(pairData || []);
        } catch (error) {
            console.error('Error loading segments:', error);
            toast.error('Failed to load segments');
        } finally {
            setIsLoading(false);
        }
    };

    // Override display mode based on display option
    useEffect(() => {
        if (displayOption === 0) setDisplayMode('solo');
        if (displayOption === 1) setDisplayMode('pair');
    }, [displayOption]);

    const renderSoloSegments = () => {
        if (isLoading) return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );

        if (soloSegments.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-indigo-300">
                        <BiSolidUser className="w-full h-full" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                        No solo segments available
                    </h3>
                </div>
            );
        }
        
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {soloSegments.map((segment) => {
                    const totalWeight = segment.criteria?.reduce((sum, criteria) => sum + criteria.weight, 0) || 0;
                    
                    return (
                        <div key={segment.id} className="relative group p-5 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
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
                                    <>
                                        {segment.criteria.map((criteria) => (
                                            <div key={criteria.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {criteria.name}
                                                </span>
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                                    {criteria.weight}%
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 font-bold">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Total Weight
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                totalWeight === 100 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            }`}>
                                                {totalWeight}%
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No criteria defined
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
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
                <div className="mx-auto h-24 w-24 text-pink-300">
                    <HiUsers className="w-full h-full" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                    No pair segments available
                </h3>
            </div>
        );
    }
        
     return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pairSegments.map((pair) => {
                const maleCriterias = pair.criterias?.filter(c => c?.type === 'male') || [];
                const femaleCriterias = pair.criterias?.filter(c => c?.type === 'female') || [];
                const maleTotalWeight = maleCriterias.reduce((sum, criteria) => sum + (parseFloat(criteria.weight) || 0), 0);
                const femaleTotalWeight = femaleCriterias.reduce((sum, criteria) => sum + (parseFloat(criteria.weight) || 0), 0);
                    
                return (
                        <div key={pair.id} className="relative group p-5 border rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
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
                                            <>
                                                {femaleCriterias.map((criteria) => (
                                                    <div key={criteria.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                            {criteria.criteria_name}
                                                        </span>
                                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                                                            {criteria.weight}%
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-2 font-bold">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Total Weight
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        femaleTotalWeight === 100 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {femaleTotalWeight}%
                                                    </span>
                                                </div>
                                            </>
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
                                            <>
                                                {maleCriterias.map((criteria) => (
                                                    <div key={criteria.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                            {criteria.criteria_name}
                                                        </span>
                                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                            {criteria.weight}%
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-2 font-bold">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Total Weight
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        maleTotalWeight === 100 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                        {maleTotalWeight}%
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                No suit criteria defined
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                    Segments List
                </h2>
            }
        >
            <Head title="Segment" />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-gray-800 shadow rounded-xl">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                        Segment List
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {displayMode === 'solo' ? 
                                            "Solo Candidate Segments" : 
                                            "Pair Candidate Segments"}
                                    </p>
                                </div>
                                
                                {displayOption === 2 && ( // Only show toggle if both are allowed
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
                                    </div>
                                )}
                            </div>

                            {displayMode === 'solo' ? renderSoloSegments() : renderPairSegments()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}