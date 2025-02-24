import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import SegmentModal from '@/Modal/SegmentModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrashAlt, FaPlus, FaEdit } from 'react-icons/fa';

export default function Asegment() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [segmentList, setSegmentList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/segments');
            if (!response.ok) throw new Error('Failed to fetch Segments');
            const data = await response.json();
            setSegmentList(data);
        } catch (error) {
            console.error('Error fetching Segments:', error);
            toast.error('Failed to load Segments');
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        fetchSegments();
    };

    const handleDeleteSegment = async (segmentId) => {
        if (window.confirm('Are you sure you want to delete this Segment?')) {
            setIsLoading(true);
            try {
                const response = await fetch(`/segments/${segmentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content
                    },
                });

                if (!response.ok) throw new Error('Failed to delete Segment');
                toast.success('Segment deleted successfully');
                fetchSegments();
            } catch (error) {
                console.error('Error deleting Segment:', error);
                toast.error('Failed to delete Segment');
            } finally {
                setIsLoading(false);
            }
        }
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
                            <button
                                onClick={openModal}
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <FaPlus size={16} /> {isLoading ? 'Loading...' : 'Add Segment'}
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500">Loading Segments...</div>
                        ) : segmentList.length === 0 ? (
                            <p className="text-gray-500 text-center">No Segments available.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {segmentList.map((segment) => (
                                    <div key={segment.id} className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md transition-transform transform hover:scale-105">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {segment.name}
                                            </h4>
                                        </div>
                                        <ul className="mt-3 space-y-2">
                                            {segment.criteria.map((criteria) => (
                                                <li key={criteria.id} className="flex justify-between border-b pb-1">
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {criteria.name}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {criteria.weight}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleDeleteSegment(segment.id)}
                                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200 ease-in-out shadow-md flex items-center gap-2"
                                                disabled={isLoading}
                                            >
                                                <FaTrashAlt size={16} /> {isLoading ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SegmentModal isOpen={isModalOpen} closeModal={closeModal} mode="create" />
        </AdminLayout>
    );
}