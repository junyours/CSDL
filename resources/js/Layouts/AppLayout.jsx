import { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Navbar from '../Components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({ children, user, breadcrumbs = [] }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar user={user} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Pass breadcrumbs to Navbar */}
                <Navbar user={user} breadcrumbs={breadcrumbs} onMobileMenu={() => setMobileOpen(!mobileOpen)} />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    {children}
                </main>
            </div>

            <Toaster
                position="top-center"  // Or 'top-center', etc.
                toastOptions={{
                    duration: 3000,  // Auto-dismiss after 3s
                    style: {
                        background: '#fff',
                        color: '#333',
                    },
                    success: {
                        style: { background: '#d1fae5', color: '#065f46' },  // Green theme
                    },
                    error: {
                        style: { background: '#fee2e2', color: '#b91c1c' },  // Red theme
                    },
                }}
            />
        </div>
    );
}