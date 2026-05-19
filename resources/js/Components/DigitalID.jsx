import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';

export default function DigitalID({
    userIdNo = "0000-0-00000",
    userProfilePhoto = "/assets/images/proper-profile-photo.png",
    studentData = null,
    userCreatedAt = null,
}) {

    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-[450px] md:min-h-0">
            <div className="rotate-90 md:rotate-0 transition-transform duration-500">
                <div
                    className="relative w-[400px] h-[250px] cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: "1000px" }}
                >
                    <motion.div
                        // 1. Initial State: Above the screen, tilted back, and transparent
                        initial={{
                            y: -100,
                            opacity: 0,
                            rotateX: -20,
                            scale: 0.9
                        }}
                        // 2. Entrance Animation: Drop to center, flatten out, and fade in
                        animate={{
                            y: 0,
                            opacity: 1,
                            rotateX: 0,
                            scale: 1,
                            // This ensures the flip logic still works alongside the entrance
                            rotateY: isFlipped ? 180 : 0
                        }}
                        // 3. The "Premium" Spring Physics
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative w-full h-full rounded-[14px] shadow-[0_0_20px_3px_rgba(0,0,0,0.3)]"
                    >

                        {/* FRONT SIDE */}
                        <div
                            className="absolute inset-0 w-full h-full rounded-xl overflow-hidden bg-white text-black border border-gray-900 transition-opacity duration-200"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                opacity: isFlipped ? 0 : 1,
                                transition: "opacity 0.15s ease",
                                pointerEvents: isFlipped ? "none" : "auto"
                            }}
                        >
                            <div className="absolute inset-0 opacity-[0.05] text-[4px] leading-tight pointer-events-none select-none overflow-hidden uppercase">
                                {Array(500).fill("OPOL COMMUNITY COLLEGE ").join(" ")}
                            </div>

                            <div className="relative flex items-center p-3 border-b border-blue-700 bg-white/80 mb-3">
                                <img src="/assets/images/school-logo.png" alt="logo" className="h-10 w-auto mr-3" />
                                <div className="text-center flex-1 leading-tight">
                                    <p className="text-[9px] font-medium">OPOL COMMUNITY COLLEGE</p>
                                    <p className="text-[9px] font-black text-blue-900 uppercase">Center for Student Development and Leadership</p>
                                </div>
                                <img src="/assets/images/csdl-logo.jpg" alt="logo" className="h-10 w-auto ml-3" />
                            </div>

                            <div className="relative z-10 flex p-3 gap-3">
                                <div className="w-1/3 flex flex-col items-center justify-center">
                                    <div className="w-20 h-24 border border-gray-500 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={
                                                userProfilePhoto.startsWith("profile-photos/")
                                                    ? `/storage/${userProfilePhoto}`
                                                    : `https://lh3.googleusercontent.com/d/${userProfilePhoto}`
                                            }
                                            alt="user"
                                            className="min-w-full min-h-full object-cover object-center block"
                                        />
                                    </div>
                                    <p className="text-[6px] mt-1 font-bold text-center leading-none text-gray-500 uppercase">IDENTIFICATION NUMBER</p>
                                    <p className="text-[11px] font-mono font-bold bg-yellow-50 border border-yellow-200 px-1 mt-1 text-blue-800">{studentData?.user_id_no}</p>
                                </div>

                                <div className="w-2/3 text-[9px] flex flex-col pt-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 space-y-1.5">
                                            <div>
                                                <p className="text-gray-500 text-[7px] leading-none uppercase tracking-tight">Last Name</p>
                                                <p className="font-bold text-[11px] leading-tight">{studentData?.last_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-[7px] leading-none uppercase tracking-tight">Given Name</p>
                                                <p className="font-bold text-[11px] leading-tight">{studentData?.first_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-[7px] leading-none uppercase tracking-tight">Middle Name</p>
                                                <p className="font-bold text-[11px] leading-tight">{studentData?.middle_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center mr-5">
                                            <div className="bg-white p-0.5 border border-gray-200 rounded-sm">
                                                <QRCodeCanvas
                                                    value={userIdNo}
                                                    size={75}
                                                    level="H"
                                                    imageSettings={{
                                                        src: "/assets/images/school-logo.png",
                                                        height: 20,
                                                        width: 20,
                                                        excavate: true,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-1 mr-5">
                                        <div className="flex justify-between border-t border-gray-300 pt-1">
                                            <div>
                                                <p className="text-gray-500 text-[7px] leading-none uppercase">Date of Birth</p>
                                                <p className="font-bold text-[9px]">{studentData?.birthday}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-500 text-[7px] leading-none uppercase">Issue Date</p>
                                                <p className="font-bold text-[9px]">{userCreatedAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BACK SIDE */}
                        <div
                            className="absolute inset-0 w-full h-full rounded-xl shadow-xl overflow-hidden 
               bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] 
               flex items-center justify-center gap-6 p-6"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                                opacity: isFlipped ? 1 : 0,
                                pointerEvents: isFlipped ? "auto" : "none"
                            }}
                        >
                            <img
                                src="/assets/images/darkMode-csdl-logo.png"
                                alt="bg"
                                className="absolute inset-0 w-full h-full object-contain opacity-10 pointer-events-none select-none"
                            />

                            {/* CONTENT (stays fully visible) */}
                            <div className="relative z-10 flex items-center gap-6">

                                {/* PROFILE PHOTO */}
                                <div className="flex flex-col items-center">
                                    <div className="w-28 h-28 border border-white/30 overflow-hidden bg-gray-200 flex-shrink-0">
                                        <img
                                            src={
                                                userProfilePhoto.startsWith("profile-photos/")
                                                    ? `/storage/${userProfilePhoto}`
                                                    : `https://lh3.googleusercontent.com/d/${userProfilePhoto}`
                                            }
                                            alt="user"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <p className="text-[11px] font-mono font-bold bg-yellow-50 border border-yellow-200 px-1 mt-1 text-blue-800">{studentData?.user_id_no}</p>

                                </div>

                                {/* QR CODE */}
                                <div className="bg-white p-2 shadow-md">
                                    <QRCodeCanvas
                                        value={userIdNo}
                                        size={190}
                                        level="H"
                                        imageSettings={{
                                            src: "/assets/images/school-logo.png",
                                            height: 45,
                                            width: 45,
                                            excavate: true
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <p className="mt-24 md:mt-4 text-[10px] text-center font-medium uppercase tracking-widest">
                {isFlipped ? "Tap to show front" : "Tap to show back"}
            </p>
        </div>
    );
}