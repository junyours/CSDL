import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    ChevronRightIcon,
    ChevronLeftIcon,
} from "@heroicons/react/24/outline";

import {
    LayoutDashboard,
    ListTodo,
    ListX,
    MapPinned,
    CalendarRange,
    Users,
    Tickets,
    HomeIcon,
    IdCard
} from "lucide-react";

import { Loader } from "lucide-react";

export default function Sidebar({
    user,
    mobileOpen,
    setMobileOpen,
    collapsed,
    setCollapsed
}) {

    const { url } = usePage();
    const [loadingHref, setLoadingHref] = useState(null);

    const toggleCollapse = () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);
        localStorage.setItem("sidebar-collapsed", newCollapsed);
    };

    useEffect(() => {
        const removeStart = router.on("start", (event) => {
            setLoadingHref(event.detail.visit.url.pathname);
        });

        const removeFinish = router.on("finish", () => {
            setLoadingHref(null);
        });

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const role = user?.user_role || "guest";

    let links = [];

    if (role === "admin") {
        links = [
            {
                label: "Menu",
                items: [
                    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
                ],
            },
            {
                label: "Setup",
                items: [
                    { name: "Violation", href: "/setup-violation", icon: ListTodo },
                    { name: "Sanction", href: "/setup-sanction", icon: ListX },
                    { name: "Location", href: "/setup-location", icon: MapPinned },
                ],
            },
            {
                label: "Manage",
                items: [
                    { name: "Events", href: "/manage-event", icon: CalendarRange },
                    { name: "Users", href: "/manage-user", icon: Users },
                    { name: "Violation Records", href: "/manage-violation-records", icon: Tickets },
                ],
            },
        ];
    }

    else if (role === 'student') {
        links = [
            {
                label: 'Menu', items: [
                    { name: 'Home', href: '/student/dashboard', icon: HomeIcon },
                    { name: 'Digital ID', href: '/student/digital-id', icon: IdCard },
                ],
            },
            { label: 'Records', items: [{ name: 'Violation', href: '/student/violations', icon: Tickets },], },
        ];
    } else if (role === 'security') {
        links = [
            { label: 'Menu', items: [{ name: 'Dashboard', href: '/security/dashboard', icon: LayoutDashboard },], },
        ];
    }

    const sidebarWidth = collapsed ? "w-20" : "w-64";

    return (
        <>
            {/* MOBILE OVERLAY */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
                fixed top-0 left-0 z-40 h-screen bg-white border-r
                transition-all duration-300
                ${sidebarWidth}
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
                flex flex-col
                `}
            >

                {/* HEADER */}
                <div
                    className={`flex items-center p-4 ${collapsed ? "justify-center" : "justify-between"
                        }`}
                >
                    {!collapsed && (
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/favicon.png" className="w-6 h-6" />
                            <span className="font-bold text-blue-700">myOCC</span>
                        </Link>
                    )}

                    <button
                        onClick={toggleCollapse}
                        className="p-1 rounded hover:bg-gray-200"
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="h-5 w-5" />
                        ) : (
                            <ChevronLeftIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* LINKS */}
                <nav className="flex-1 overflow-y-auto mt-4">

                    {links.map((group) => (
                        <div key={group.label} className="mb-4">

                            {!collapsed && (
                                <p className="px-4 text-xs text-gray-400 uppercase mb-2">
                                    {group.label}
                                </p>
                            )}

                            {group.items.map((link) => {

                                const Icon = link.icon;
                                const isActive = url.startsWith(link.href);
                                const isLoading = loadingHref === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => {
                                            setMobileOpen(false);
                                            setLoadingHref(link.href);
                                        }}
                                        className={`
                                        flex items-center rounded-lg mx-3 my-1 transition
                                        ${collapsed ? "justify-center py-3" : "px-4 py-3"}
                                        ${isActive
                                                ? "bg-blue-700 text-white"
                                                : "hover:bg-blue-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {isLoading ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}

                                        {!collapsed && (
                                            <span className="ml-3">{link.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                </nav>
            </aside>
        </>
    );
}