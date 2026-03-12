import AppLayout from '../../../Layouts/AppLayout';
import DigitalID from '../../../Components/DigitalID';
import { AlertTriangle, ArrowRight, Clock, Info, ShieldCheck } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function Index({ auth, studentData, userCreatedAt }) {
    const user = auth?.user;

    return (
        <AppLayout user={user}>
            <div>
                {user?.profile_photo ? (
                    <div className="flex flex-col items-center">
                        <div className="text-center mb-12">
                            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                                My Digital ID
                            </h1>
                            <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-2">
                                <ShieldCheck size={16} className="text-green-500" />
                                Verified Student Identity
                            </p>
                        </div>
                        <DigitalID
                            userIdNo={user?.user_id_no || '0000-0-00000'}
                            userProfilePhoto={user?.profile_photo}
                            studentData={studentData}
                            userCreatedAt={userCreatedAt}
                        />
                    </div>
                ) : (
                    /* UPLOAD PROMPT - Kept consistent but polished */
                    <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
                        <div className="bg-yellow-50 border-b border-yellow-100 p-4 flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-yellow-700" />
                            </div>
                        </div>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-800 text-center">Profile Photo Required</h2>
                            <p className="text-slate-600 mt-3 text-center leading-relaxed">
                                To generate your unique QR Code and access campus services, please upload a formal photo.
                            </p>

                            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Photo Requirements</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                                    <li className="flex items-center gap-2">✅ White Background</li>
                                    <li className="flex items-center gap-2">✅ Face Visible</li>
                                    <li className="flex items-center gap-2">✅ Formal Attire</li>
                                    <li className="flex items-center gap-2">✅ No Accessories</li>
                                </ul>
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => router.visit('/profile')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-200"
                                >
                                    Go to Profile
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}