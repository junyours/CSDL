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
                    <div className="flex flex-col min-h-screen items-center justify-center relative overflow-hidden bg-slate-200">

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center w-full px-4">
                            <div className="relative z-10 flex flex-col items-center w-full px-4">
                                <div className="text-center mb-12">
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                        My Digital ID
                                    </h1>

                                    {/* P: Adjusted to a light, subtle badge that matches bg-slate-200 */}
                                    <p className="inline-flex items-center justify-center gap-2 mt-3 py-1 px-4 rounded-full bg-white/50 border border-slate-300 shadow-sm">
                                        <ShieldCheck size={16} className="text-emerald-600" />
                                        <span className="text-[10px] font-bold text-slate-600 tracking-wider">
                                            Verified
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <DigitalID
                                userIdNo={user?.user_id_no || '0000-0-00000'}
                                userProfilePhoto={user?.profile_photo}
                                studentData={studentData}
                                userCreatedAt={userCreatedAt}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white border border-yellow-200 shadow-sm rounded-xl p-8">

                        {/* ICON */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-yellow-600" />
                            </div>
                        </div>

                        {/* TITLE */}
                        <h2 className="text-xl font-semibold text-gray-800 text-center">
                            Profile Photo Required
                        </h2>

                        <p className="text-sm text-gray-600 mt-2 text-center">
                            To access your violation records,
                            please upload a proper profile photo following the instructions below.
                        </p>

                        {/* STEPS */}
                        <div className="mt-6 space-y-4 text-sm text-gray-700">

                            <div>
                                <ul className="list-disc list-inside mt-2 text-gray-600">
                                    <li>Plain white or light background</li>
                                    <li>Face clearly visible</li>
                                    <li>No filters or heavy editing</li>
                                    <li>No sunglasses, caps, or obstructions</li>
                                </ul>
                            </div>

                        </div>

                        {/* IMAGE REFERENCE */}
                        <div className="mt-8">
                            <p className="text-sm font-semibold text-gray-800 mb-3 text-center">
                                Reference Example
                            </p>

                            <div className="flex justify-center">
                                <img
                                    src="/assets/images/proper-profile-photo.jpg"
                                    alt="Proper Profile Photo Example"
                                    className="w-40 h-40 object-cover border border-gray-400 shadow"
                                />
                            </div>
                        </div>

                        {/* WARNING NOTE */}
                        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                                Important Notice:
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                                <span>Failure to follow the profile photo guidelines may result in </span>
                                <span className="font-semibold">automatic account deactivation</span>.
                            </p>
                        </div>

                        {/* BUTTON */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => router.visit('/profile')}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Go to Profile <ArrowRight className="w-4 h-4 inline-block ml-1" />
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </AppLayout>
    );
}