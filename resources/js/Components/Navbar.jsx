import {
    Bars3Icon,
    IdentificationIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    BellIcon,
    ExclamationTriangleIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';
import { router, usePage } from '@inertiajs/react';
import { InboxIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Navbar({ user, onMobileMenu, breadcrumbs = [] }) {
    const [openProfile, setOpenProfile] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const [userNotifications, setUserNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get('/user-notifications');
            setUserNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            // Optimistically update local state to clear unread UI
            setUserNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        // 1. Mark as read in the database
        if (!notif.is_read) {
            try {
                await axios.post(`/notifications/${notif.id}/mark-as-read`);

                // 2. Update local state so the UI updates instantly
                setUserNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }

        // 3. Navigate to the link if it exists
        if (notif.data?.link) {
            router.visit(notif.data.link);
            setOpenNotifications(false); // Close dropdown
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const { url } = usePage();
    const isProfileActive = url.startsWith('/profile');
    const isDigitalIDActive = url.startsWith('/student/digital-id');

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfile(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setOpenNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const getNotificationStyles = (type) => {
        switch (type) {
            case 'violation':
                return {
                    icon: <ExclamationTriangleIcon className="h-4 w-4" />,
                    bg: 'bg-red-100 text-red-600',
                    dot: 'bg-red-600'
                };
            case 'announcement':
                return {
                    icon: <MegaphoneIcon className="h-4 w-4" />,
                    bg: 'bg-blue-100 text-blue-600',
                    dot: 'bg-blue-600'
                };
            default:
                return {
                    icon: <BellIcon className="h-4 w-4" />,
                    bg: 'bg-indigo-100 text-indigo-600',
                    dot: 'bg-indigo-600'
                };
        }
    };

    const userAvatar = user?.profile_photo ? (
        <img
            src={

                user.profile_photo.startsWith("profile-photos/")
                    ? `/storage/${user.profile_photo}`
                    : `https://lh3.googleusercontent.com/d/${user.profile_photo}`
            }
            alt="User Avatar"
            className="h-9 w-9 ring-2 ring-gray-100 rounded-full object-cover"
        />
    ) : (
        <UserCircleIcon className="h-9 w-9 text-gray-700" />
    );

    return (
        <nav className="bg-white border-b sticky top-0 z-40 w-full">
            <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between">
                {/* LEFT SECTION */}
                <div className="flex items-center space-x-3">
                    <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition" onClick={onMobileMenu}>
                        <Bars3Icon className="h-6 w-6 text-gray-700" />
                    </button>
                    <div className="lg:hidden font-extrabold text-indigo-600 text-xl tracking-tighter">myOCC</div>
                    <div className="hidden lg:block text-sm uppercase tracking-wider font-medium text-gray-600">
                        {breadcrumbs.length > 0 ? (
                            breadcrumbs.map((item, index) => (
                                <span key={index}>
                                    {item}
                                    {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-300">/</span>}
                                </span>
                            ))
                        ) : "Dashboard"}
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex items-center space-x-1 md:space-x-3">
                    <button className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                        <MagnifyingGlassIcon className="h-6 w-6" />
                    </button>

                    {/* NOTIFICATIONS DROPDOWN */}
                    {user?.user_role === 'student' && (
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    const newState = !openNotifications;
                                    setOpenNotifications(newState);
                                    setOpenProfile(false);
                                    if (newState) fetchNotifications();
                                }}
                                className={`p-1 rounded-full transition relative hover:bg-gray-100 ${openNotifications ? 'bg-gray-100 text-indigo-600' : 'text-gray-600'}`}
                            >
                                <BellIcon className="h-6 w-6" />
                                {userNotifications.filter(n => !n.is_read).length > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold ring-2 ring-white">
                                        {userNotifications.filter(n => !n.is_read).length}
                                    </span>
                                )}
                            </button>

                            {openNotifications && (
                                <div className="absolute right-[-103px] sm:right-0 md:right-[-90px] w-[320px] md:w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-white">
                                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                        {userNotifications.some(n => !n.is_read) && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-[11px] text-indigo-600 font-bold hover:text-indigo-800 transition uppercase tracking-tight"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                                <span className="text-xs text-gray-400 mt-2">Checking for updates...</span>
                                            </div>
                                        ) : userNotifications.length > 0 ? (
                                            userNotifications.map((notif) => {
                                                const theme = getNotificationStyles(notif.notifiable_type);
                                                return (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`group px-4 py-4 border-b border-gray-50 transition-all cursor-pointer relative flex items-start space-x-3
                        ${!notif.is_read ? 'bg-indigo-50/40 hover:bg-indigo-50' : 'hover:bg-gray-50'}`}
                                                    >
                                                        {/* Unread dot indicator */}
                                                        {!notif.is_read && (
                                                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full shadow-sm ${theme.dot}`}></div>
                                                        )}

                                                        {/* Icon Container */}
                                                        <div className={`mt-1 p-2 rounded-lg shrink-0 transition-colors ${!notif.is_read ? theme.bg : 'bg-gray-100 text-gray-400'}`}>
                                                            {theme.icon}
                                                        </div>

                                                        {/* Text Content */}
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <p className={`text-sm leading-snug truncate ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {notif.data?.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                                {notif.data?.message}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-gray-400 mt-2 flex items-center italic">
                                                                <span className="mr-1 opacity-70">●</span>
                                                                {formatTimeAgo(notif.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                                <div className="bg-gray-50 p-4 rounded-full">
                                                    <InboxIcon className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-800 mt-4">All caught up!</h4>
                                                <p className="text-xs text-gray-400 mt-1">You have no new notifications.</p>
                                            </div>
                                        )}
                                    </div>

                                    {userNotifications.length > 0 && (
                                        <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-50 text-center">
                                            <button className="text-[11px] text-gray-500 font-medium hover:text-gray-700">View History</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* QUICK ACCESS DIGITAL ID */}
                    {user?.user_role === 'student' && (
                        <button
                            onClick={() => router.visit('/student/digital-id')}
                            className={`p-2 rounded-full transition hover:bg-gray-100 ${isDigitalIDActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                        >
                            <IdentificationIcon className="h-6 w-6" />
                        </button>
                    )}

                    {/* PROFILE DROPDOWN */}
                    <div className="relative pl-1 md:pl-2" ref={profileRef}>
                        <button
                            className="flex items-center transition-transform active:scale-95 ring-offset-2 focus:ring-2 focus:ring-indigo-500 rounded-full"
                            onClick={() => {
                                setOpenProfile(!openProfile);
                                setOpenNotifications(false);
                            }}
                        >
                            {userAvatar}
                        </button>

                        {openProfile && (
                            <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account</p>
                                </div>
                                <button
                                    onClick={() => { router.visit('/profile'); setOpenProfile(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center space-x-2 ${isProfileActive ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-gray-700'}`}
                                >
                                    <span>Profile</span>
                                </button>
                                <div className="border-t border-gray-50 mt-1">
                                    <button
                                        onClick={() => router.post('/logout')}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 font-medium transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}