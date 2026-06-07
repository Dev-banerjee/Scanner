"use client";

import { useState, useEffect } from "react";
import { Activity, Command, Lock, LogOut, Info } from "lucide-react";
import { Logo } from "./Logo";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
    activeItem?: string; // Optional now, we derive it ourselves
}

export function Sidebar({ activeItem: propActiveItem }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Derive active item from pathname (ignore prop if not provided)
    const activeItem = propActiveItem || (
        pathname === "/" ? "Scanner" :
            pathname.includes("/live-activity") ? "Live Activity" :
                pathname.includes("/history") ? "Dashboard" :
                    pathname.includes("/about") ? "About Us" : ""
    );

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems = [
        { name: "Scanner", icon: Command, href: "/", gradient: "from-blue-500/20 to-cyan-500/20" },
        { name: "Live Activity", icon: Activity, href: "/live-activity" },
        { name: "Dashboard", icon: Activity, href: "/history", gradient: "from-purple-500/20 to-blue-500/20" },
        { name: "About Us", icon: Info, href: "/about", gradient: "from-purple-500/20 to-blue-500/20" },
    ];

    return (
        <div className="w-[300px] bg-bg-sidebar border-r border-white/5 rounded-[40px] p-8 flex flex-col hidden lg:flex h-full overflow-hidden shadow-2xl relative z-50">
            {/* Logo Section */}
            <div className="flex items-center justify-center mb-8 mt-2 shrink-0 relative z-10">
                <Link href="/" className="group">
                    <Logo size="normal" />
                </Link>
            </div>

            {/* Navigation - Scrollable Area */}
            <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar min-h-0 mb-4">
                {navItems.map((item) => {
                    const isActive = activeItem === item.name;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-300 group relative overflow-hidden shrink-0 ${isActive ? "text-white shadow-lg shadow-purple-900/20" : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {isActive && (
                                <>
                                    {/* Active Background Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-[24px]" />

                                    {/* Left Accent Bar */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-purple-500 rounded-r-full shadow-[0_0_15px_#a855f7]" />
                                </>
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-white/40"}`} />
                            <span className={`font-medium relative z-10 text-[15px] ${isActive ? "tracking-wide" : ""}`}>{item.name}</span>
                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-purple-400 blur-[1px] shadow-[0_0_8px_currentColor] animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Card - Real Google Data */}
            <div className="shrink-0 pt-2 border-t border-white/5">
                {user ? (
                    <div className="relative group bg-white/5 rounded-[32px] p-4 transition-all hover:bg-white/10 border border-white/5 hover:border-white/10 mt-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full blur-[2px]" />
                                {user.user_metadata?.avatar_url ? (
                                    <Image
                                        src={user.user_metadata.avatar_url}
                                        alt="User"
                                        width={48}
                                        height={48}
                                        className="rounded-full relative z-10 border-2 border-black object-cover w-12 h-12"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full relative z-10 flex items-center justify-center text-white font-bold">
                                        {user.email?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                )}
                                {/* Online Dot */}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#09090b] rounded-full z-20"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate text-sm">
                                    {user.user_metadata?.full_name || user.email?.split('@')[0] || "Agent"}
                                </h3>
                                <p className="text-white/40 text-xs truncate">{user.email}</p>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-pulse h-16 bg-white/5 rounded-[32px] mt-4"></div>
                )}
            </div>
        </div>
    );
}
