"use client";

import { useState, useEffect } from "react";
import { Menu, X, Activity, Command, Lock, LogOut, History, Info } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
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
        setIsOpen(false);
        router.push("/login");
    };

    const navItems = [
        { name: "Scanner", icon: Command, href: "/" },
        { name: "Live Activity", icon: Activity, href: "/live-activity" },
        { name: "Dashboard", icon: History, href: "/history" },
        { name: "About Us", icon: Info, href: "/about" },
    ];

    const isActive = (href: string) => pathname === href;

    // Don't show on login page
    if (pathname === "/login") return null;

    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg-base/90 backdrop-blur-xl border-b border-white/10 safe-area-top">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo size="small" />
                    </Link>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <X size={20} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Menu size={20} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="lg:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-bg-inner border-l border-white/10 backdrop-blur-xl z-50 flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between safe-area-top">
                                <span className="text-white/60 text-sm font-medium">Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive(item.href)
                                                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-white/10"
                                                : "text-white/50 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium text-[15px]">{item.name}</span>
                                            {isActive(item.href) && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* User Section */}
                            <div className="p-4 border-t border-white/10 safe-area-bottom">
                                {user ? (
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                {user.user_metadata?.avatar_url ? (
                                                    <Image
                                                        src={user.user_metadata.avatar_url}
                                                        alt="User"
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border-2 border-cyan-500/50 object-cover w-10 h-10"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {user.email?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium text-sm truncate">
                                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                                </p>
                                                <p className="text-white/40 text-xs truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="animate-pulse h-24 bg-white/5 rounded-2xl" />
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
