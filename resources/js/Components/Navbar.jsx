import { Bars3Icon, IdentificationIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ user, onMobileMenu, breadcrumbs = [] }) {
    const [openProfile, setOpenProfile] = useState(false);
    const profileRef = useRef(null);

    const { url } = usePage();
    const isProfileActive = url.startsWith('/profile');

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfile(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const breadcrumbItems = breadcrumbs.map((item, index) => (
        <span key={index} className="text-gray-600">
            {item}
            {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
        </span>
    ));

    const isDigitalIDActive = url.startsWith('/student/digital-id');

    return (
        <>
            {/* ================= DESKTOP NAVBAR ================= */}
            <nav className="hidden lg:flex bg-white border-b px-6 py-3 items-center justify-between sticky top-0 z-20">
                {/* Left */}
                <div className="flex items-center space-x-3">
                    {/* <button
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={onMobileMenu}
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-700" />
                    </button> */}

                    <div className="text-sm uppercase tracking-wider">
                        {breadcrumbItems.length > 0
                            ? breadcrumbItems
                            : <span>Dashboard</span>}
                    </div>
                </div>

                {/* Right */}
                <div className="relative" ref={profileRef}>
                    <button
                        className="flex items-center rounded-full"
                        onClick={() => setOpenProfile(!openProfile)}
                    >
                        {user?.profile_photo ? (
                            <img
                                src={
                                    user.profile_photo.startsWith("profile-photos/")
                                        ? `/storage/${user.profile_photo}`
                                        : `https://lh3.googleusercontent.com/d/${user.profile_photo}`
                                }
                                alt="User Avatar"
                                className="h-9 w-9 ring ring-gray-300 rounded-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon className="h-9 w-9 text-gray-700" />
                        )}
                    </button>

                    {openProfile && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-30">
                            <button
                                onClick={() => router.visit('/profile')}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${isProfileActive ? 'bg-indigo-50 text-indigo-600 font-medium' : ''
                                    }`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => router.post('/logout')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* ================= MOBILE BOTTOM TAB ================= */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-40">
                <div className="flex justify-around items-center py-2">

                    {/* MENU TAB */}
                    <button
                        onClick={onMobileMenu}
                        className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
                    >
                        <Bars3Icon className="h-6 w-6" />
                        <span className="text-xs mt-1">Menu</span>
                    </button>

                    {/* DIGITAL ID TAB (Special Action) */}
                    {user?.user_role === 'student' && (
                        <div className="relative -top-5"> {/* Lifts the button above the bar */}
                            <button
                                onClick={() => router.visit('/student/digital-id')}
                                className={`flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300 transform active:scale-95 ${isDigitalIDActive
                                    ? 'bg-indigo-600 text-white ring-4 ring-white'
                                    : 'bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50'
                                    }`}
                            >
                                <IdentificationIcon className={`${isDigitalIDActive ? 'h-8 w-8' : 'h-7 w-7'}`} />
                            </button>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    <button
                        onClick={() => router.visit('/profile')}
                        className={`flex flex-col items-center transition ${isProfileActive
                            ? 'text-indigo-600'
                            : 'text-gray-600 hover:text-indigo-600'
                            }`}
                    >
                        {user?.profile_photo ? (
                            <img
                                src={
                                    user.profile_photo.startsWith("profile-photos/")
                                        ? `/storage/${user.profile_photo}`
                                        : `https://lh3.googleusercontent.com/d/${user.profile_photo}`
                                }
                                alt="User Avatar"
                                className={`h-7 w-7 rounded-full ring-2 ring-gray-100 object-cover ${isProfileActive ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                            />
                        ) : (
                            <UserCircleIcon className="h-7 w-7" />
                        )}
                        <span className="text-xs mt-1">Profile</span>
                    </button>

                </div>
            </div>
        </>
    );
}
