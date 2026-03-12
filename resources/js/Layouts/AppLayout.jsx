import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { Toaster } from "react-hot-toast";

export default function AppLayout({ children, user, breadcrumbs = [] }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("sidebar-collapsed");
        if (stored) setCollapsed(stored === "true");
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">

            <Sidebar
                user={user}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* MAIN CONTENT AREA */}
            <div
                className={`
                flex flex-col min-h-screen transition-all duration-300
                ${collapsed ? "lg:ml-20" : "lg:ml-64"}
                `}
            >
                <Navbar
                    user={user}
                    breadcrumbs={breadcrumbs}
                    onMobileMenu={() => setMobileOpen(!mobileOpen)}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
                        {children}
                    </div>
                </main>
            </div>

            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                }}
            />
        </div>
    );
}