import { Wrench, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import AppLayout from "../Layouts/AppLayout";

export default function Maintenance({ auth }) {
    const user = auth?.user;

    return (
        <AppLayout user={user} breadcrumbs={["Under Maintenance"]}>
            <div className="flex items-center justify-center min-h-[70vh]">

                {/* Card Container */}
                <div className="relative w-full max-w-2xl">
                    {/* Background Glow */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

                    {/* Main Card */}
                    <div className="relative p-8 md:p-12 text-center overflow-hidden">

                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <Clock size={16} />
                            System Maintenance Ongoing
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-indigo-50 rounded-2xl">
                                <Wrench className="w-12 h-12 text-indigo-600 animate-spin-slow" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
                            We're Upgrading Our System
                        </h1>

                        {/* Description */}
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8">
                            We're performing scheduled improvements to enhance performance,
                            security, and reliability. The system will be available again shortly.
                            Thank you for your patience.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-200"
                            >
                                <RefreshCw size={18} />
                                Refresh Page
                            </button>

                            <button
                                onClick={() => window.history.back()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
                            >
                                <ArrowLeft size={18} />
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
