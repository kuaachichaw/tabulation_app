import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

   

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Segment List</h2>}
        >
            <Head title="Segment" />
            <ToastContainer />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-lg rounded-lg dark:bg-gray-800 p-6">
                     

                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500">Loading Segments...</div>
                        ) : segmentList.length === 0 ? (
                            <p className="text-gray-500 text-center">No Segments available.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {segmentList.map((segment) => (
                                    <div key={segment.id} className="p-5 border rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md transition-transform transform hover:scale-105">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{segment.name}</h4>
                                        <ul className="mt-3 space-y-2">
                                            {segment.criteria.map((criteria) => (
                                                <li key={criteria.id} className="flex justify-between border-b pb-1">
                                                    <span className="text-gray-700 dark:text-gray-300">{criteria.name}</span>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{criteria.weight}%</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </AuthenticatedLayout>
    );
}
