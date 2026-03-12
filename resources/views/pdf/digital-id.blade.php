{{-- Ensure you have Tailwind CSS and Alpine.js loaded in your main layout --}}
{{-- <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script> --}}

<div x-data="{ isFlipped: false }" class="flex flex-col items-center justify-center min-h-[450px] md:min-h-0 font-sans">
    
    <div class="rotate-90 md:rotate-0 transition-transform duration-500">
        {{-- Card Container with Perspective --}}
        <div 
            class="relative w-[400px] h-[250px] cursor-pointer"
            @click="isFlipped = !isFlipped"
            style="perspective: 1000px;"
        >
            {{-- Motion Wrapper --}}
            <div 
                class="relative w-full h-full transition-transform duration-700 ease-in-out"
                style="transform-style: preserve-3d;"
                :style="isFlipped ? 'transform: rotateY(180deg);' : 'transform: rotateY(0deg);'"
            >
                
                {{-- ================= FRONT FACE ================= --}}
                <div 
                    class="absolute inset-0 w-full h-full rounded-xl shadow-xl overflow-hidden bg-white text-black border border-gray-900"
                    style="backface-visibility: hidden;"
                >
                    {{-- Watermark --}}
                    <div class="absolute inset-0 opacity-[0.05] text-[4px] leading-tight pointer-events-none select-none overflow-hidden uppercase break-words">
                        {{ str_repeat("OPOL COMMUNITY COLLEGE ", 500) }}
                    </div>

                    {{-- Header --}}
                    <div class="relative flex items-center p-3 border-b border-blue-700 bg-white/80">
                        <img src="{{ asset('assets/images/school-logo.png') }}" alt="school logo" class="h-10 w-auto mr-3" />
                        <div class="text-center flex-1 leading-tight">
                            <p class="text-[9px] font-medium">OPOL COMMUNITY COLLEGE</p>
                            <p class="text-[9px] font-black text-blue-900 uppercase">Center for Student Development and Leadership</p>
                        </div>
                        <img src="{{ asset('assets/images/csdl-logo.jpg') }}" alt="csdl logo" class="h-10 w-auto ml-3" />
                    </div>

                    {{-- Body --}}
                    <div class="relative z-10 flex p-3 gap-3">
                        
                        {{-- Left Column (Photo & ID) --}}
                        <div class="w-1/3 flex flex-col items-center">
                            <div class="w-20 h-24 border border-gray-500 bg-gray-100 flex items-center justify-center overflow-hidden">
                                @php
                                    $photo = $user->profile_photo ?? '';
                                    $photoUrl = str_starts_with($photo, 'profile-photos/') 
                                        ? asset('storage/' . $photo) 
                                        : (empty($photo) ? asset('assets/images/proper-profile-photo.jpg') : "http://googleusercontent.com/profile/picture/{$photo}");
                                @endphp
                                <img src="{{ $photoUrl }}" alt="user" class="w-full h-full object-cover" />
                            </div>
                            <p class="text-[6px] mt-1 font-bold text-center leading-none text-gray-500">IDENTIFICATION NUMBER</p>
                            <p class="text-[11px] font-mono font-bold bg-yellow-50 border border-yellow-200 px-1 mt-1 text-blue-800">
                                {{ $userIdNo ?? '0000-0-00000' }}
                            </p>
                        </div>

                        {{-- Right Column (Details) --}}
                        <div class="w-2/3 text-[9px] flex flex-col pt-1">
                            <div class="flex justify-between items-start gap-2">
                                
                                {{-- Name Fields --}}
                                <div class="flex-1 space-y-1.5">
                                    <div>
                                        <p class="text-gray-500 text-[7px] leading-none uppercase tracking-tight">Last Name</p>
                                        <p class="font-bold text-[11px] leading-tight uppercase">{{ $user->last_name ?? 'LABIS' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500 text-[7px] leading-none uppercase tracking-tight">Given Name</p>
                                        <p class="font-bold text-[11px] leading-tight uppercase">{{ $user->given_name ?? 'MARIA BIANCA CHRISTELLE' }}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-500 text-[7px] leading-none uppercase tracking-tight">Middle Name</p>
                                        <p class="font-bold text-[11px] leading-tight uppercase">{{ $user->middle_name ?? 'SENILLO' }}</p>
                                    </div>
                                </div>

                                {{-- Small QR Code --}}
                                <div class="flex flex-col items-center mr-5">
                                    <div class="bg-white p-0.5 border border-gray-200 rounded-sm">
                                        <img src="data:image/svg+xml;base64,{{ base64_encode(SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(75)->errorCorrection('H')->generate($userIdNo ?? '0000-0-00000')) }}" alt="Small QR" />
                                    </div>
                                </div>
                            </div>

                            {{-- Footer Data --}}
                            <div class="mt-auto pt-1 mr-5">
                                <div class="flex justify-between border-t border-gray-300 pt-1">
                                    <div>
                                        <p class="text-gray-500 text-[7px] leading-none uppercase">Date of Birth</p>
                                        <p class="font-bold text-[9px] uppercase">{{ $user->dob ?? '03-AUG-2003' }}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-gray-500 text-[7px] leading-none uppercase">Issue Date</p>
                                        <p class="font-bold text-[9px] uppercase">{{ $issueDate ?? date('d-M-Y') }}</p>
                                    </div>
                                </div>

                                <div class="mt-2 relative">
                                    <div class="w-full h-8 border border-dashed border-gray-400 rounded bg-gray-50/50 flex items-center justify-center">
                                        <span class="text-[6px] text-gray-400 uppercase tracking-widest">Signature</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- ================= BACK FACE ================= --}}
                <div 
                    class="absolute inset-0 w-full h-full rounded-xl shadow-xl overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white flex flex-col items-center justify-center p-6"
                    style="backface-visibility: hidden; transform: rotateY(180deg);"
                >
                    <div class="bg-white p-2 rounded-lg shadow-lg">
                        <img src="data:image/svg+xml;base64,{{ base64_encode(SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(130)->errorCorrection('H')->generate($userIdNo ?? '0000-0-00000')) }}" alt="Large QR" />
                    </div>

                    <div class="mt-4 text-center">
                        <p class="text-[7px] text-blue-300 tracking-widest uppercase">IDENTIFICATION NUMBER</p>
                        <p class="font-mono text-[15px] font-bold tracking-wider">{{ $userIdNo ?? '0000-0-00000' }}</p>
                    </div>
                </div>

            </div>
        </div>
    </div>

    {{-- Helper Text --}}
    <p class="mt-24 md:mt-4 text-gray-500 text-[10px] text-center font-medium uppercase tracking-widest" x-text="isFlipped ? 'Tap to view Details' : 'Tap to view QR Code'">
        Tap to view QR Code
    </p>

    {{-- Download Button --}}
    <button 
        onclick="window.open('/digital-id/download', '_blank')"
        class="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
    >
        {{-- Lucide React 'Download' converted to pure SVG --}}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Printable ID
    </button>
</div>