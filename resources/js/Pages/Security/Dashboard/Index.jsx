import AppLayout from '@/Layouts/AppLayout';
import { useEffect, useState } from 'react';
import { useStudentLookup } from './hooks/useStudentLookUp';

import SearchDropdown from './components/SearchDropdown';
import ManualSearch from './components/ManualSearch';
import QrScannerModal from './components/QrScannerModal';
import StudentResultModal from './components/StudentResultModal';
import { Calendar, Tickets, Zap } from 'lucide-react';

import CountUp from 'react-countup';

export default function Index({ auth, totalIssuedTicketToday, userInformation }) {
    const { student, loading, error, lookup } = useStudentLookup();

    const [mode, setMode] = useState(null);
    const [manualId, setManualId] = useState('');
    const [resultOpen, setResultOpen] = useState(false);
    const [currentId, setCurrentId] = useState('');

    const [scannerOpen, setScannerOpen] = useState(false);

    const handleLookup = async (id) => {
        setCurrentId(id);
        await lookup(id);
        setResultOpen(true);
        setMode(null);
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const firstName = (userInformation?.first_name || "Security").trim().split(' ')[0];

    return (
        <AppLayout user={auth.user}>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-2 space-y-2 px-4 md:py-8">
                {/* HEADER (UNCHANGED) */}
                <header className="py-4 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {greeting}, <span className="text-indigo-600">{firstName}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 text-slate-400 bg-slate-50 self-start md:self-auto px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-slate-100">
                        <Calendar size={16} className="md:w-[18px]" />
                        <span className="text-[10px] md:text-sm font-semibold uppercase tracking-tight">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </header>

                {/* ENHANCED CONTENT SECTION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1">
                        {/* Gradient accent matching the indigo header theme */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    Total Violations Today
                                </p>

                                <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    <CountUp
                                        start={0}
                                        end={totalIssuedTicketToday}
                                        duration={2}
                                        separator=","
                                    />
                                </h2>
                            </div>

                            {/* Icon Container matching header's calendar badge style but with Indigo punch */}
                            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                                <Tickets className="h-6 w-6 md:h-7 md:w-7" />
                            </div>
                        </div>
                    </div>
                </div>

                <SearchDropdown
                    onScan={() => setScannerOpen(true)}
                    onType={() => setMode('type')}
                />


                {mode === 'type' && (
                    <ManualSearch
                        value={manualId}
                        onChange={setManualId}
                        onSubmit={() => handleLookup(manualId)}
                        error={error}
                        loading={loading}
                    />
                )}

            </div>
            <StudentResultModal
                open={resultOpen}
                onClose={() => setResultOpen(false)}
                id={currentId}
                student={student}
                loading={loading}
                error={error}
            />

            <QrScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onResult={handleLookup}
                loading={loading}
            />
        </AppLayout>
    );
}
