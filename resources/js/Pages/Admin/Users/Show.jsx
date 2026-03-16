import React, { useState } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import {
    User, Calendar, MapPin,
    GraduationCap, ArrowLeft,
    Check, ShieldCheck, KeyRound,
    Clock, Clipboard, AlertTriangle,
    Mail, VenusAndMarsIcon,
    Users, BookOpen, Search,
    Hash
} from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import axios from "axios";

export default function Show({ auth, studentData }) {
    const user = auth?.user;
    const info = Array.isArray(studentData) ? studentData[0] : studentData;
    const enrollment = info?.current_enrollment;

    const [resetModal, setResetModal] = useState({ show: false, password: "", step: "confirm" });

    if (!info) {
        return (
            <AppLayout user={user} breadcrumbs={["Manage", "Users"]}>
                <div className="p-8 text-center text-gray-500">No user data found.</div>
            </AppLayout>
        );
    }

    const handlePasswordReset = async () => {
        setResetModal({ ...resetModal, step: "processing" });
        try {
            const response = await axios.post(`/manage/user/reset-password`, {
                user_id_no: info.user_id_no
            });
            setResetModal({ show: true, password: response.data.new_password, step: "success" });
            toast.success("Password reset successfully!");
        } catch (error) {
            setResetModal({ show: false, password: "", step: "confirm" });
            toast.error("Failed to reset password.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Users", `${info.user_id_no}`]}>
            {/* Facebook-style outer container 
                Using a light gray background typically seen on social media feeds
            */}
            <div className="bg-[#F0F2F5] min-h-screen pb-12 font-sans">

                {/* Header Profile Section (White Background) */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-6xl mx-auto w-full">

                        {/* Cover Photo Placeholder */}
                        <div className="relative h-full md:h-full w-full bg-gradient-to-br from-indigo-100 to-purple-200 rounded-b-xl border-b border-gray-200">
                            <img
                                src="/assets/images/cover.jpg"
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>

                        {/* Profile Info Row */}
                        <div className="px-4 md:px-8 relative pb-0">
                            <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 md:-mt-8 mb-4">

                                {/* Avatar & Name */}
                                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                    <div className="relative z-10 w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                                        {info.avatar ? (
                                            <img
                                                src={
                                                    info.avatar.startsWith("profile-photos/")
                                                        ? `/storage/${info.avatar}`
                                                        : `https://lh3.googleusercontent.com/d/${info.avatar}`
                                                }
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-400">
                                                <User size={64} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center md:text-left mt-2 md:mt-12 md:pb-4">
                                        <h1 className="text-xl md:text-[25px] font-bold text-gray-900 leading-tight">
                                            {info.first_name} {info.middle_name} {info.last_name}
                                        </h1>
                                        <p className="text-gray-500 font-semibold mt-1">
                                            {info.user_id_no}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 md:mt-0 md:pb-4 flex gap-2">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                </div>
                            </div>

                            {/* Fake Profile Tabs */}
                            <div className="border-t border-gray-300 flex gap-1 pt-1">
                                <div className="text-blue-600 font-semibold border-b-[3px] border-blue-600 px-4 py-3 cursor-pointer">
                                    About
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="max-w-6xl mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Left Column: Intro (FB Style Sidebar) */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h2 className="font-bold text-gray-900 mb-4">Intro</h2>

                            <div className="space-y-4">
                                <IntroRow icon={<Mail />} text={info.email_address} />
                                <IntroRow icon={<MapPin />} text={`Lives in ${info.present_address} ${info.zip_code}`} />
                                <IntroRow icon={<VenusAndMarsIcon />} text={`${info.gender}`} />
                                <IntroRow icon={<Calendar />} text={`Born on ${formatDate(info.birthday)}`} />
                                <IntroRow icon={<Clock />} text={`Joined ${formatDate(info.created_at)}`} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & "Posts" */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Enrollment Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Card Header with Status */}
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    Enrollment Details
                                </h2>
                                {enrollment ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <div className="p-6">
                                {enrollment ? (
                                    <div className="space-y-6">
                                        {/* Hero Section of the Card */}
                                        <div className="relative p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-100/50">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                                                {enrollment.year_section?.course?.department?.department_name || "Academic Department"}
                                            </p>
                                            <h3 className="font-extrabold text-gray-900 leading-tight">
                                                {enrollment.year_section?.course?.course_name}
                                            </h3>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <FBDetailBox
                                                icon={<Users size={18} className="text-gray-400" />}
                                                label="Year & Section"
                                                value={`${enrollment.year_section?.year_level?.year_level} — ${enrollment.year_section?.section}`}
                                            />
                                            <FBDetailBox
                                                icon={<BookOpen size={18} className="text-gray-400" />}
                                                label="Semester"
                                                value={enrollment.year_section?.school_year?.semester?.semester_name}
                                            />
                                            <FBDetailBox
                                                icon={<Calendar size={18} className="text-gray-400" />}
                                                label="Academic Year"
                                                value={`${enrollment.year_section?.school_year?.start_year} — ${enrollment.year_section?.school_year?.end_year}`}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* Enhanced Empty State */
                                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
                                            <Search size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">No active enrollment</h3>
                                        <p className="text-sm text-gray-500 max-w-[280px] mx-auto mt-2 leading-relaxed">
                                            We couldn't find an active record for this semester. Please visit the
                                            <span className="font-semibold text-gray-700"> Registrar's Office</span> to verify your status.
                                        </p>
                                        <button className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                            View Enrollment History →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Security Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="font-bold text-gray-900">Account Security</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gray-100 rounded-full text-gray-700">
                                        <KeyRound size={20} />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-gray-900">Reset Password</p>
                                        <p className="text-sm text-gray-500">Generate a new secure password for this user.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResetModal({ ...resetModal, show: true, step: 'confirm' })}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <PasswordResetModal
                state={resetModal}
                setState={setResetModal}
                onConfirm={handlePasswordReset}
                onCopy={() => { navigator.clipboard.writeText(resetModal.password); toast.success("Copied!"); }}
            />
        </AppLayout>
    );
}

/** * Helper Component: Intro Row (Facebook left sidebar style) 
 */
function IntroRow({ icon, text }) {
    return (
        <div className="flex items-center gap-3 text-gray-800">
            <span className="text-gray-400">{React.cloneElement(icon, { size: 20 })}</span>
            <span className="text-[15px]">{text || "---"}</span>
        </div>
    );
}

/** * Helper Component: Styled Detail Box for Enrollment Info
 */
function FBDetailBox({ icon, label, value, highlight = false }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${highlight ? 'bg-blue-50/50 border-blue-100 text-blue-900' : 'bg-white border-gray-200 text-gray-800'}`}>
            <div className={highlight ? "text-blue-500" : "text-gray-500"}>
                {icon}
            </div>
            <div>
                <p className={`text-xs font-semibold ${highlight ? 'text-blue-500' : 'text-gray-500'}`}>
                    {label}
                </p>
                <p className="text-sm font-bold mt-0.5">
                    {value || "N/A"}
                </p>
            </div>
        </div>
    );
}

/** * Keep existing Modal but matched it more cleanly to the standard styling 
 */
function PasswordResetModal({ state, setState, onConfirm, onCopy }) {
    if (!state.show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
                {state.step === "confirm" ? (
                    <>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Reset Password?</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            This will generate a new password for the user and sign them out from any device where they are currently logged in.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setState({ ...state, show: false })}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Reset Now
                            </button>
                        </div>
                    </>
                ) : state.step === "processing" ? (
                    <div className="py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                        <p className="mt-4 text-sm font-semibold text-gray-600">Generating secure password...</p>
                    </div>
                ) : (
                    <>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                            <Check size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Password Generated</h3>
                        <p className="text-sm text-gray-500 mt-1">Copy and share with the user securely.</p>

                        <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg">
                            <code className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                                {state.password}
                            </code>
                        </div>

                        <button
                            onClick={onCopy}
                            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                        >
                            <Clipboard size={18} /> Copy Password
                        </button>
                        <button
                            onClick={() => setState({ show: false, password: "", step: "confirm" })}
                            className="mt-3 w-full px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}