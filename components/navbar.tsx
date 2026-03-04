"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    // Helper to highlight active routes
    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo / Brand Name */}
                    <Link
                        href="/"
                        className="text-xl font-black tracking-tighter uppercase italic hover:text-emerald-400 transition-colors"
                    >
                        REAL <span className="text-zinc-500">OR</span> AI
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex space-x-8">
                        <Link
                            href="/play"
                            className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive("/play") ? "text-emerald-400" : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            Play
                        </Link>

                        <Link
                            href="/leaderboard"
                            className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive("/leaderboard") ? "text-emerald-400" : "text-zinc-400 hover:text-white"
                                }`}
                        >
                            Leaderboard
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
}
