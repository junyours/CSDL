import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Navbar({ user, onMobileMenu, breadcrumbs = [] }) {
    // Breadcrumbs items
    const breadcrumbItems = breadcrumbs.map((item, index) => (
        <span key={index} className="text-gray-600">
            {item}
            {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
        </span>
    ));

    // Notification dropdown
    const [openNotif, setOpenNotif] = useState(false);
    const notifRef = useRef(null);

    // Profile dropdown
    const [openProfile, setOpenProfile] = useState(false);
    const profileRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setOpenNotif(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfile(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-white border-b-2 px-4 py-3 flex items-center justify-between w-full sticky top-0 z-20">
            {/* LEFT SIDE: Hamburger + Breadcrumbs */}
            <div className="flex items-center space-x-3">
                <button
                    className="lg:hidden p-1 hover:bg-gray-200 rounded"
                    onClick={onMobileMenu}
                >
                    <Bars3Icon className="h-6 w-6 text-gray-700" />
                </button>

                {/* Breadcrumbs Desktop */}
                <div className="hidden sm:flex text-sm uppercase font-regular text-gray-700 tracking-wider">
                    {breadcrumbItems.length > 0 ? breadcrumbItems : <span className="text-gray-600">Dashboard</span>}
                </div>

                {/* Breadcrumb Mobile */}
                <div className="sm:hidden text-xs font-thin text-gray-700 uppercase tracking-wide">
                    {breadcrumbs[breadcrumbs.length - 1] || "Dashboard"}
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                {/* <div className="relative" ref={notifRef}>
                    <button
                        className="relative p-2 rounded hover:bg-gray-100"
                        onClick={() => setOpenNotif(!openNotif)}
                    >
                        <BellIcon className="h-6 w-6 text-gray-700" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {openNotif && (
                        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border z-30 animate-fadein">
                            <div className="p-3 border-b font-semibold text-gray-700">
                                Notifications
                            </div>
                            <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                <p className="text-sm text-gray-800">You have a new message.</p>
                                <span className="text-xs text-gray-500">2 min ago</span>
                            </div>
                            <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                <p className="text-sm text-gray-800">System update completed.</p>
                                <span className="text-xs text-gray-500">1 hour ago</span>
                            </div>
                            <div className="p-3 hover:bg-gray-50 cursor-pointer text-center text-blue-600 text-sm">
                                View all notifications
                            </div>
                        </div>
                    )}
                </div> */}

                {/* Profile Avatar */}
                <div className="relative" ref={profileRef}>
                    <button
                        className="flex items-center rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setOpenProfile(!openProfile)}
                    >
                        {user?.profile_photo ? (
                            <img
                                src={`/storage/${user.profile_photo}`}
                                alt="User Avatar"
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon className="h-8 w-8 text-gray-700" />
                        )}
                    </button>


                    {openProfile && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-30 animate-fadein">
                            <button
                                onClick={() => router.visit('/profile')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-t"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => router.post('/logout')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 rounded-b"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
