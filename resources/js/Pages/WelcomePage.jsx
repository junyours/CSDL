import { Link } from "@inertiajs/react";
import { ArrowRightIcon, CloudDownloadIcon, SparklesIcon, User } from "lucide-react";
import React from "react";
import { usePage } from "@inertiajs/react";

export default function WelcomePage() {
    const { apkInfo } = usePage().props;
    const { apkUrl, version } = apkInfo;

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white">

            {/* Decorative blurred gradients */}
            <div className="pointer-events-none absolute -top-32 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/40 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 right-0 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-indigo-400/40 blur-3xl" />

            {/* Header */}
            <header className="relative z-10">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                            <img
                                src="/assets/images/favicon.png"
                                alt="App Preview"
                                className="h-7 w-7"
                            />
                            <span>myOCC</span>
                        </div>
                        <ul className="hidden items-center gap-10 md:flex text-base font-medium opacity-90">
                            <li className="cursor-pointer hover:opacity-100">Home</li>
                            <li className="cursor-pointer hover:opacity-100">Features</li>
                            <li className="cursor-pointer hover:opacity-100">About</li>
                            <li className="cursor-pointer hover:opacity-100">FAQ</li>
                        </ul>
                        <Link
                            href="/login"
                            className="
    flex items-center justify-center
    h-10 w-10
    rounded-full
    bg-white/15
    backdrop-blur-md
    transition
    hover:bg-white/25
    focus:outline-none
    focus:ring-2 focus:ring-cyan-300/50
  "
                            aria-label="Login"
                        >
                            <User className="h-6 w-6 text-white" />
                        </Link>

                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 overflow-hidden">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">

                    {/* Left Content */}
                    <div className="flex flex-col items-center text-center md:items-start md:text-left">

                        {/* Badge */}
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
                            <SparklesIcon className="h-4 w-4 text-cyan-300" />
                            Your all-in-one campus app
                        </span>

                        {/* Heading */}
                        <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight md:text-5xl">
                            Keep your records
                            <span className="block bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                                smarter & faster
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
                            Track attendance, manage violation records, and monitor campus activity
                            seamlessly with smart face recognition.
                        </p>

                        {/* Buttons */}
                        <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                            <button
                                className="group inline-flex items-center justify-center gap-3 rounded-full
          bg-cyan-400 px-7 py-3 text-base font-semibold text-slate-900
          transition hover:bg-cyan-300"
                            >
                                Get Started
                                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>

                            <a
                                href={apkUrl}
                                download
                                className="inline-flex items-center justify-center gap-3 rounded-full
    border border-white/30 bg-white/5 px-7 py-3 text-base font-semibold
    backdrop-blur-md transition hover:bg-white/15"
                            >
                                <CloudDownloadIcon className="h-5 w-5" />
                                Download App {version}
                            </a>


                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative flex justify-center md:justify-end">

                        {/* Glow */}
                        <div className="pointer-events-none absolute -bottom-20 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl md:h-96 md:w-96 md:right-24 md:translate-x-0" />

                        {/* Image */}
                        <img
                            src="/assets/images/hand-holding-phone.png"
                            alt="Mobile App Preview"
                            className="
    relative z-10
    w-44 sm:w-56 md:w-72 lg:w-[450px]
    drop-shadow-[0_40px_80px_rgba(0,0,0,0.45)]
    transition-transform duration-500 hover:scale-105
  "
                        />

                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between text-sm text-white/80">

                    {/* Left: Copyright */}
                    <span>© 2025 myOCC. Crafted for modern mobile experiences.</span>

                    {/* Right: Optional links */}
                    <div className="mt-4 md:mt-0 flex gap-4">
                        <a href="/#" className="hover:text-cyan-300 transition">Privacy Policy</a>
                        <a href="/#" className="hover:text-cyan-300 transition">Terms of Service</a>
                        <a href="/#" className="hover:text-cyan-300 transition">Contact</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}
