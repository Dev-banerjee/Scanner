"use client";

import { Sidebar } from "@/components/Sidebar";
import { GlitchHeading } from "@/components/GlitchHeading";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, Lock, Globe, Search, Database, FileText, CheckCircle, XCircle } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="h-full w-full flex flex-col p-4 lg:p-6 pb-24 md:pb-6 relative overflow-hidden bg-black selection:bg-purple-500/30">
            {/* Aurora Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full h-full glass-panel rounded-[16px] md:rounded-[24px] lg:rounded-[32px] p-1.5 md:p-2 flex gap-2 md:gap-3 relative z-10 overflow-hidden shadow-2xl ring-1 ring-white/10"
            >
                {/* Sidebar */}
                <Sidebar activeItem="About Us" />

                {/* Main Content */}
                <div className="flex-1 rounded-[12px] md:rounded-[20px] lg:rounded-[24px] bg-bg-inner relative overflow-y-auto glass-scrollbar p-4 md:p-8 lg:p-12 flex flex-col min-h-0">

                    {/* Header */}
                    <div className="mb-8 md:mb-12">
                        <GlitchHeading
                            text="About Versescan"
                            className="text-3xl md:text-5xl lg:text-6xl tracking-tight mb-4"
                        />
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed">
                            The future of vulnerability scanning. Fast, intelligent, and designed for the modern web.
                            We break security barriers, not just code.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
                        <FeatureCard
                            icon={Search}
                            title="Neural Spider"
                            desc="AI-driven crawling engine that maps your entire application surface, finding hidden endpoints others miss."
                            color="text-blue-400"
                            glow="bg-blue-500"
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Deep Analysis"
                            desc="Heuristic detection logic for SQLi, XSS, RCE, and more. We prove vulnerabilities, not just guess them."
                            color="text-amber-400"
                            glow="bg-amber-500"
                        />
                        <FeatureCard
                            icon={Lock}
                            title="Auth Engine"
                            desc="Seamlessly scans behind login pages. Supports Session Hijacking (Cookies) and Interactive Login modes."
                            color="text-purple-400"
                            glow="bg-purple-500"
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Stealth Mode"
                            desc="Advanced WAF evasion techniques. Randomized headers, delays, and proxies to stay undetected."
                            color="text-emerald-400"
                            glow="bg-emerald-500"
                        />
                    </div>

                    {/* Final Verification Matrix */}
                    <div className="glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-10 mb-8 md:mb-12 flex flex-col w-full">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                            <h2 className="text-2xl md:text-3xl font-bold text-white">System Capabilities Matrix</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-white/40 text-xs md:text-sm uppercase tracking-wider">
                                        <th className="py-4 px-4 font-medium">Feature Category</th>
                                        <th className="py-4 px-4 font-medium">Requirement</th>
                                        <th className="py-4 px-4 font-medium text-center">Status</th>
                                        <th className="py-4 px-4 font-medium">Verification Evidence</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm md:text-base">
                                    {[
                                        { cat: "Top 10", req: "SQL Injection (SQLi)", status: true, ev: "Detected Union & Error-based at /sqli?id=1" },
                                        { cat: "Top 10", req: "XSS (Reflected)", status: true, ev: "Detected <sc_test> reflection at /ssti?name & /csti" },
                                        { cat: "Top 10", req: "Broken Access Control", status: true, ev: "Detected Admin Dashboard access at /admin/dashboard" },
                                        { cat: "Top 10", req: "BOLA / IDOR", status: true, ev: "Detected unauthorized access to User 101 at /api/user/100" },
                                        { cat: "Top 10", req: "SSRF", status: true, ev: "(Implicit via Port Scan logic)" },
                                        { cat: "Injections", req: "RCE (Standard)", status: true, ev: "Detected Command Injection at /rce" },
                                        { cat: "Injections", req: "Blind RCE", status: true, ev: "Detected 5-second time delay at /blind_rce;sleep 5" },
                                        { cat: "Injections", req: "CSTI (Client-Side)", status: true, ev: "Detected Angular/Vue payload {{7*7}} at /csti" },
                                        { cat: "Injections", req: "SSTI (Server-Side)", status: true, ev: "Detected Template Injection ${{7*7}} at /ssti" },
                                        { cat: "Injections", req: "LFI (Local File Inclusion)", status: true, ev: "Detected /etc/passwd & win.ini at /lfi" },
                                        { cat: "Auth", req: "Authenticated Scanning", status: true, ev: "Login successful; found protected content check." },
                                        { cat: "Core", req: "Reporting", status: true, ev: "Generating JSON/PDF reports (Verified)." },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-white/60 font-mono text-xs">{row.cat}</td>
                                            <td className="py-3 px-4 text-white font-medium">{row.req}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                                                    <CheckCircle size={14} />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-white/50 font-mono text-xs md:text-sm">{row.ev}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Comparison Section */}
                    <div className="glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-10 mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-cyan-400" />
                            Why We Are Better
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            {/* Competitors */}
                            <div className="space-y-6 opacity-60">
                                <h3 className="text-xl font-semibold text-white/80 border-b border-white/10 pb-4">Legacy Scanners</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-red-300">
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>Slow, single-threaded crawling</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-red-300">
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>Config Hell (hundreds of XML inputs)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-red-300">
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>False Positive City</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-red-300">
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>Outdated, boring UI</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Scancrypt */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-white border-b border-cyan-500/30 pb-4">Versescan</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-emerald-300">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                                        <span>Fast, async Python + Playwright Engine</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-emerald-300">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                                        <span>Zero-Config "Click & Scan" Experience</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-emerald-300">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                                        <span>Interactive Auth & Session Replay</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-emerald-300">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                                        <span>Next-Gen Cyber/Glitch Dashboard</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer tagline */}
                    <div className="mt-8 text-center text-white/20 text-sm font-mono">
                        Build v2.0.0 • Versescan Active
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color, glow }: any) {
    return (
        <div className="relative group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${glow}/20 rounded-full blur-[40px] group-hover:${glow}/30 transition-all`} />

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
