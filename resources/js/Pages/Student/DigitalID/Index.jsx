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
                    <div className="flex flex-col min-h-screen items-center justify-center relative overflow-hidden bg-slate-950">
                        {/* Animated Gradient Background */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-900/20" />
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse [animation-delay:2s]" />
                        </div>

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col items-center w-full px-4">
                            <div className="text-center mb-12">
                                <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                                    My Digital ID
                                </h1>
                                <p className="text-slate-400 text-sm mt-2 flex items-center justify-center gap-2 bg-slate-900/50 py-1 px-3 rounded-full border border-slate-800">
                                    <ShieldCheck size={16} className="text-emerald-400" />
                                    <span className="font-medium">Verified Identity</span>
                                </p>
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