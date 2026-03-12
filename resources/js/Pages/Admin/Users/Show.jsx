import React, { useState } from "react";
import AppLayout from "../../../Layouts/AppLayout";
import {
    User, Calendar, MapPin,
    GraduationCap, Fingerprint, ArrowLeft, Edit3,
    Check, ShieldCheck, KeyRound, UserX,
    UserCheck, Clock, Clipboard, AlertTriangle,
    FileUser,
    Mail,
    VenusAndMars,
    VenusAndMarsIcon,
    GraduationCapIcon,
    Users,
    BookOpen
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
            <AppLayout user={user} breadcrumbs={["Manage", "Users",]}>
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

    return (
        <AppLayout user={user} breadcrumbs={["Manage", "Users", `${info.user_id_no}`]}>
            <div className="">

                {/* Header Section */}
                <div className="bg-white rounded-t-2xl border-x border-t border-gray-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        {info.avatar ? (
                            <img
                                src={
                                    info.avatar.startsWith("profile-photos/")
                                        ? `/storage/${info.avatar}`
                                        : `https://lh3.googleusercontent.com/d/${info.avatar}`
                                }
                                alt="Avatar"
                                className="h-24 w-24 rounded-full border-4 border-indigo-50 object-cover shadow-sm"
                            />
                        ) : (
                            <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
                                <User size={48} strokeWidth={1.5} />
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 uppercase">
                            {info.first_name} {info.middle_name} {info.last_name}
                        </h1>
                        <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                {info.user_id_no}
                            </span>
                            <span className="text-gray-400 justify-center flex items-center">
                                <Mail size={14} className="mr-2" />{info.email_address}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => window.history.back()} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Body Grid */}
                <div className="bg-white border border-gray-100 rounded-b-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Personal Info - READ ONLY */}
                    <section className="space-y-12">
                        <div>
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <FileUser size={20} className="text-indigo-600" />
                                    </div>
                                    <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Personal Information</h2>
                                </div>
                            </div>
                            <div className="relative overflow-hidden">
                                <div>
                                    <InfoField label="Full Name" value={`${info.first_name} ${info.middle_name} ${info.last_name}`} icon={<User size={16} />} />
                                    <InfoField label="Birthday" value={formatDate(info.birthday)} icon={<Calendar size={16} />} />
                                    <InfoField label="Sex" value={info.gender} icon={<VenusAndMarsIcon size={16} />} />
                                    <InfoField label="Present Address" value={`${info.present_address} ${info.zip_code}`} icon={<MapPin size={16} />} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Academic & Security Section */}
                    <section className="space-y-12">
                        <div>
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <GraduationCapIcon size={20} className="text-indigo-600" />
                                    </div>
                                    <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Enrollment Information</h2>
                                </div>
                                {enrollment && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Enrolled
                                    </span>
                                )}
                            </div>

                            {enrollment ? (
                                <div className="relative overflow-hidden">
                                    <div>
                                        {/* Course Info */}
                                        <div className="mb-4">
                                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1">
                                                {enrollment.year_section?.course?.department?.department_name || "Department"}
                                            </p>
                                            <h3 className="text-md font-extrabold text-gray-900 leading-tight">
                                                {enrollment.year_section?.course?.course_name}
                                            </h3>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Year & Section */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="text-indigo-500">
                                                    <Users size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase text-gray-400 font-bold leading-none mb-1">Year & Section</p>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        {enrollment.year_section?.year_level?.year_level} - {enrollment.year_section?.section}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Semester */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="text-indigo-500">
                                                    <BookOpen size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase text-gray-400 font-bold leading-none mb-1">Semester</p>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        {enrollment.year_section?.school_year?.semester?.semester_name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Academic Year - Full Width */}
                                            <div className="col-span-2 flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                                <Calendar size={16} className="text-indigo-500" />
                                                <div className="flex justify-between w-full items-center">
                                                    <p className="text-[9px] uppercase text-indigo-400 font-bold">Academic Year</p>
                                                    <p className="text-sm font-bold text-indigo-900">
                                                        {enrollment.year_section?.school_year?.start_year} — {enrollment.year_section?.school_year?.end_year}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="group p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-indigo-300 transition-colors">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3 group-hover:bg-indigo-50">
                                        <Search size={20} className="text-gray-400 group-hover:text-indigo-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No active enrollment found</p>
                                    <p className="text-xs text-gray-400 mt-1">Please contact the registrar to settle your status.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <ShieldCheck size={20} className="text-red-600" />
                                    </div>
                                    <h2 className="font-bold text-red-800 uppercase text-xs tracking-wider">Account Security</h2>
                                </div>
                            </div>
                            <div className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm">
                                <StatusAction
                                    title="Reset Password"
                                    desc="Reset to a new system-generated password"
                                    icon={<KeyRound size={18} />}
                                    btnLabel="Reset"
                                    onClick={() => setResetModal({ ...resetModal, show: true, step: 'confirm' })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Footer Timestamps */}
                    <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between gap-4 text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                Registered: <span className="text-gray-600 ml-1">{new Date(info.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}</span>
                            </span>
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

/** * Simplified Read-Only InfoField
 */
function InfoField({ label, value, icon }) {
    return (
        <div className="p-3 rounded-xl border border-transparent transition-all">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {label}
            </p>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-indigo-400">{icon}</span>
                <span className="font-bold text-gray-700 text-sm">{value || "---"}</span>
            </div>
        </div>
    );
}

function StatusAction({ title, desc, icon, btnLabel, onClick, isHazard }) {
    return (
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 border-t first:border-0 border-gray-50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isHazard ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>{icon}</div>
                <div>
                    <p className="text-sm font-bold text-gray-800">{title}</p>
                    <p className="text-[11px] text-gray-500">{desc}</p>
                </div>
            </div>
            <button onClick={onClick} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider border rounded-xl transition-all ${isHazard ? 'text-red-500 border-red-100 hover:bg-red-500 hover:text-white' : 'bg-white border-gray-200 hover:bg-gray-900 hover:text-white'}`}>
                {btnLabel}
            </button>
        </div>
    );
}

function PasswordResetModal({ state, setState, onConfirm, onCopy }) {
    if (!state.show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200">
                {state.step === "confirm" ? (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Reset Password?</h3>
                        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                            This will generate a new password for the user and sign them out from any device where they are currently logged in.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setState({ ...state, show: false })} className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 font-bold text-sm text-gray-600 transition-colors">Cancel</button>
                            <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200 transition-all">Reset Now</button>
                        </div>
                    </>
                ) : state.step === "processing" ? (
                    <div className="py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto"></div>
                        <p className="mt-6 text-sm font-bold text-gray-600 uppercase tracking-widest">Generating secured random password...</p>
                    </div>
                ) : (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500 mb-6">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">New Password Generated!</h3>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">Copy and share with user</p>
                        <div className="mt-4 p-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                            <code className="text-3xl font-mono font-black text-indigo-600 tracking-tighter">{state.password}</code>
                        </div>
                        <button onClick={onCopy} className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 font-bold shadow-xl shadow-gray-200">
                            <Clipboard size={18} /> Copy Password
                        </button>
                        <button onClick={() => setState({ show: false, password: "", step: "confirm" })} className="mt-4 w-full text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest py-2">Close</button>
                    </>
                )}
            </div>
        </div>
    );
}