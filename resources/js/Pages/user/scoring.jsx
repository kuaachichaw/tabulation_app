import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

export default function scoring() {
    const user = usePage().props.auth?.user;
    console.log("User Data:", user);
   
    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                        <p>{user ? `Welcome, ${user.name}` : "No user logged in"}</p>

                        <div className="bg-blue-500 sm:bg-green-500 md:bg-red-500 lg:bg-yellow-500">
    This box changes color based on screen size.
</div>

                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
