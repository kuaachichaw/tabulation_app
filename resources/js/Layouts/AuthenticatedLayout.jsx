import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-gray-900 text-gray-200 h-screen shadow-lg flex flex-col">
                <div className="p-4 flex items-center justify-center border-b border-gray-700">
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                    </Link>
                </div>

                <nav className="mt-4 flex-grow">
                    <ul className="space-y-2">
                        {[
                            { name: "Dashboard", routeName: "user" },
                            { name: "Candidates", routeName: "candidate" },
                            { name: "Segment", routeName: "segment" },
                            { name: "Scoring", routeName: "scoring" },
                        ].map(({ name, routeName }) => (
                            <li key={routeName}>
                                <NavLink
                                    href={route(routeName)}
                                    active={route().current(routeName)}
                                    className={({ isActive }) =>
                                        `flex items-center w-full px-6 py-3 rounded-lg transition ${
                                            isActive
                                                ? "bg-gray-700 text-white font-semibold shadow"
                                                : "hover:bg-gray-800 hover:text-white"
                                        }`
                                    }
                                >
                                    {name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800 p-4 flex justify-between items-center">
                    <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        {header}
                    </div>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                {user?.name ?? 'Admin'}
                                <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </nav>

             

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
