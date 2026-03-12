import AppLayout from '../../Layouts/AppLayout';
import {
    AlertTriangle,
    ArrowRight,
    Newspaper,
    ShieldCheck,
    Zap,
    ExternalLink,
    Calendar
} from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Dashboard({ auth, unsettledCount, studentData }) {
    const user = auth?.user;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const firstName = (studentData?.first_name || "Student").trim().split(' ')[0];

    return (
        <AppLayout user={user}>
            {/* Reduced padding on mobile (px-4), kept original on desktop */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24">

                {/* --- HERO SECTION --- */}
                <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-1 md:mb-2">
                            <Zap size={12} fill="currentColor" />
                            Overview
                        </div>
                        {/* Scaled down text for mobile (text-3xl) */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {greeting}, <span className="text-indigo-600">{firstName}</span>
                        </h1>
                        <p className="text-slate-500 text-sm md:text-base font-medium flex items-center gap-2">
                            {unsettledCount > 0
                                ? "You have items that require attention."
                                : "Your account is in good standing."}
                        </p>
                    </div>

                    {/* Date Display: Now visible on mobile but smaller/subtle */}
                    <div className="flex items-center gap-2 md:gap-3 text-slate-400 bg-slate-50 self-start md:self-auto px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-slate-100">
                        <Calendar size={16} className="md:w-[18px]" />
                        <span className="text-[10px] md:text-sm font-semibold uppercase tracking-tight">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </header>

                {/* --- MAIN BENTO GRID --- */}
                {/* Changed gap to 4 on mobile for tighter look */}
                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6">

                    {/* COMPLIANCE/VIOLATION CARD */}
                    <div className={`md:col-span-3 lg:col-span-4 group relative overflow-hidden p-6 md:p-8 rounded-3xl md:rounded-[2rem] border transition-all duration-500 ${unsettledCount > 0
                        ? 'bg-white border-red-100 shadow-lg shadow-red-500/5'
                        : 'bg-white border-emerald-100 shadow-lg shadow-emerald-500/5'
                        }`}>
                        
                       

                        <div className="space-y-1">
                            <div className="flex items-baseline gap-3">
                                {/* Scaled down 7xl to 5xl on mobile */}
                                <span className={`text-5xl md:text-7xl font-black tracking-tighter ${unsettledCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                    {unsettledCount}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Pending Violations</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">
                                {unsettledCount > 0
                                    ? "Please settle these records to avoid registration blocks."
                                    : "You're all clear! No violations recorded."}
                            </p>
                        </div>

                        <button
                            onClick={() => router.visit('/student/violations')}
                            className={`mt-6 md:mt-10 w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${unsettledCount > 0
                                ? 'bg-red-600 text-white shadow-lg shadow-red-200 active:scale-95'
                                : 'bg-slate-900 text-white active:scale-95'
                                }`}
                        >
                            {unsettledCount > 0 ? 'Resolve Now' : 'View History'}
                            <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    </div>

                    {/* ACADEMIC RECORDS */}
                    <a
                        href="https://sis.occph.com/enrollment-record"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:col-span-3 lg:col-span-4 group p-6 md:p-8 rounded-3xl md:rounded-[2rem] bg-white border border-slate-100 shadow-lg shadow-slate-500/5 transition-all flex flex-col justify-between active:scale-[0.98]"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-6 md:mb-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl md:text-2xl shadow-inner">
                                    SIS
                                </div>
                                <div className="p-2 rounded-full bg-slate-50 text-slate-400">
                                    <ExternalLink size={18} />
                                </div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800">Student Information</h3>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                                View official grades, enrollment status, and evaluate faculties.
                            </p>
                        </div>
                        <div className="mt-6 md:mt-8 flex items-center text-indigo-600 font-bold text-sm">
                            Go to Portal <ArrowRight size={16} className="ml-2" />
                        </div>
                    </a>

                    {/* NEWS & UPDATES */}
                    <a
                        href="https://occ.edu.ph/news"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:col-span-6 lg:col-span-4 group p-6 md:p-8 rounded-3xl md:rounded-[2rem] bg-slate-900 border border-slate-800 shadow-xl transition-all flex flex-col justify-between overflow-hidden relative active:scale-[0.98]"
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 md:w-32 md:h-32 bg-emerald-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6 md:mb-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400">
                                    <Newspaper size={28} md:size={32} />
                                </div>
                                <div className="p-2 rounded-full bg-white/5 text-slate-400">
                                    <ExternalLink size={18} />
                                </div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white">Campus Feed</h3>
                            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                Stay synced with upcoming events and official announcements.
                            </p>
                        </div>
                        <div className="relative z-10 mt-6 md:mt-8 flex items-center text-emerald-400 font-bold text-sm">
                            Read Latest News <ArrowRight size={16} className="ml-2" />
                        </div>
                    </a>

                </div>
            </div>
        </AppLayout>
    );
}