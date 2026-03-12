import {
    UserIcon, Mail, Phone, Calendar, MapPin, LogOut, VenusAndMars, Camera, ChevronDown
} from "lucide-react";
import AppLayout from "../../Layouts/AppLayout";
import { router } from "@inertiajs/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from 'axios';
import Cropper from "react-easy-crop";

export default function Index({ auth, studentData, userInfoData, avatar }) {
    const user = auth?.user;
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);
    const fileInputRef = useRef(null);

    // Business Logic remains untouched...
    const handleLogout = () => router.post("/logout");
    const handleAvatarClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { setImageSrc(reader.result); setShowCropModal(true); };
        reader.readAsDataURL(file);
    };
    const onCropComplete = (_, pixels) => setCroppedAreaPixels(pixels);
    const createImage = (url) => new Promise((res, rej) => {
        const img = new Image();
        img.addEventListener("load", () => res(img));
        img.addEventListener("error", (e) => rej(e));
        img.setAttribute("crossOrigin", "anonymous");
        img.src = url;
    });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 400;
        canvas.width = size; canvas.height = size;
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
        return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
    };

    const handleCropSave = async () => {
        if (!croppedAreaPixels || isUploading) return;
        setIsUploading(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            router.post("/profile/avatar", { avatar: croppedBlob }, {
                forceFormData: true, preserveScroll: true,
                onSuccess: () => { setShowCropModal(false); setImageSrc(null); router.reload({ only: ['avatar'] }); }
            });
            toast.success("Profile picture updated!");
        } catch (e) { toast.error("Upload failed"); } finally { setIsUploading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        try {
            const res = await axios.post('/profile/change-password', {
                new_password: newPassword, new_password_confirmation: confirmPassword,
            });
            toast.success(res.data.message);
            setNewPassword(''); setConfirmPassword('');
            setShowChangePassword(false);
        } catch (err) { toast.error(err.response?.data?.errors?.new_password?.[0] || "Failed to change password"); }
        finally { setLoadingPassword(false); }
    };

    const data = user?.user_role === "student" ? studentData : userInfoData;

    return (
        <AppLayout user={user} breadcrumbs={["Profile"]}>
            <div className="pb-20">
                <div className="px-0 max-w-md mx-auto space-y-4">

                    {/* PROFILE CARD */}
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-indigo-600 h-24 w-full"></div>
                        <div className="px-6 pb-6">
                            <div className="relative -mt-12 mb-4">
                                <div
                                    onClick={handleAvatarClick}
                                    className="relative group w-24 h-24 mx-auto rounded-md border-4 border-white shadow-md overflow-hidden bg-slate-200 cursor-pointer"
                                >
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <UserIcon className="w-12 h-12 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>

                            <div className="text-center">
                                <h2 className="text-md font-bold text-slate-900 leading-tight">
                                    {data?.first_name} {data?.last_name}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium">ID: {user?.user_id_no}</p>
                                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                                    {user?.user_role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* INFORMATION GROUPS */}
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 divide-y divide-slate-100">
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <InfoRow icon={<VenusAndMars size={18} />} label="Gender" value={data?.gender || '-'} />
                            <InfoRow icon={<Calendar size={18} />} label="Birthday" value={data?.birthday || '-'} />
                        </div>
                        <div className="p-4 space-y-6">
                            <InfoRow icon={<Mail size={18} />} label="Email Address" value={data?.email_address || '-'} />
                            <InfoRow icon={<Phone size={18} />} label="Contact Number" value={data?.contact_number || '-'} />
                            <InfoRow icon={<MapPin size={18} />} label="Current Address" value={`${data?.present_address || ''} ${data?.zip_code || ''}`.trim() || '-'} />
                        </div>
                    </div>

                    {/* CHANGE PASSWORD */}
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="w-full flex justify-between items-center p-4 hover:bg-slate-50 transition-colors"
                        >
                            <span className="font-semibold text-slate-700 text-sm">Security & Password</span>
                            <ChevronDown className={`text-slate-400 transition-transform ${showChangePassword ? 'rotate-180' : ''}`} size={20} />
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ${showChangePassword ? "max-h-96 opacity-100 p-4 border-t border-slate-100" : "max-h-0 opacity-0"}`}>
                            <form onSubmit={handleChangePassword} className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm outline-none transition ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'}`}
                                    required
                                />
                                {newPassword && confirmPassword && newPassword !== confirmPassword ? <p className="text-red-500 text-sm">Passwords do not match.</p> : null}
                                <button
                                    type="submit"
                                    disabled={loadingPassword || (newPassword !== confirmPassword)}
                                    className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-indigo-100 shadow-lg hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
                                >
                                    {loadingPassword ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* LOGOUT */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 font-semibold py-3.5 rounded-2xl hover:bg-red-50 transition active:scale-[0.98]"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* CROP MODAL ENHANCEMENT */}
            {showCropModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom">
                        <h1 className="text-xl font-bold text-slate-800 mb-4 text-center">Adjust Photo</h1>
                        <div className="relative w-full h-72 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-400">MIN</span>
                            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-indigo-600" />
                            <span className="text-xs font-bold text-slate-400">MAX</span>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowCropModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                            <button onClick={handleCropSave} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 w-full">
            {/* Icon container: flex-shrink-0 ensures it doesn't get squished by long text */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex-shrink-0 mt-0.5">
                {icon}
            </div>
            
            {/* Text container: flex-1 allows it to fill the width and wrap content */}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-1">
                    {label}
                </p>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed break-words">
                    {value}
                </p>
            </div>
        </div>
    );
}