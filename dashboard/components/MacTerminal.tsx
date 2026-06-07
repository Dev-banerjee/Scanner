"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MacTerminalProps {
    logs: string[];
    isRunning?: boolean;
    title?: string;
}

export function MacTerminal({ logs, isRunning = true, title = "system_init.exe" }: MacTerminalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="w-full rounded-[16px] overflow-hidden bg-[#0D1117]/90 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] backdrop-blur-md relative group h-full flex flex-col">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%] opacity-20"></div>

            {/* Window Chrome */}
            <div className="flex items-center gap-4 px-4 py-3 bg-[#161B22]/80 border-b border-cyan-500/10 z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-[#27CA40] opacity-80" />
                </div>
                <div className="flex-1 font-mono text-sm text-cyan-500/50">
                    {title}
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-2 glass-scrollbar relative z-10"
                style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace" }}
            >
                {(!logs || logs.length === 0) && (
                    <div className="text-cyan-500/30 flex flex-col gap-2 animate-pulse">
                        <div className="flex items-center gap-2">
                            <span className="text-pink-500">›</span>
                            <span>SYSTEM BOOT SEQUENCE INITIATED...</span>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                            <span className="text-cyan-500/50">Loading kernel modules...</span>
                        </div>
                    </div>
                )}

                {(logs || []).map((log, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1 }}
                        className="flex items-start gap-3 group/line text-[13px] leading-relaxed"
                    >
                        <span className="text-pink-500 select-none font-bold mt-[1px]">›</span>
                        <span className={`${getLogColor(log)} break-all`}>{log}</span>
                    </motion.div>
                ))}

                {isRunning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 pl-4 mt-2"
                    >
                        <span className="w-2 h-4 bg-cyan-500/50 animate-pulse block"></span>
                    </motion.div>
                )}
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 bg-[#161B22]/80 border-t border-cyan-500/10 flex items-center justify-between text-[10px] uppercase tracking-widest z-10 shrink-0 text-cyan-500/40">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-cyan-500"}`} />
                    <span>{isRunning ? "Status: Online" : "Status: Idle"}</span>
                </div>
                <span>HACKATHON 2026</span>
            </div>
        </div>
    );
}

function getLogColor(log: string): string {
    const lowerLog = (log || "").toLowerCase();

    if (lowerLog.includes("critical") || lowerLog.includes("error") || lowerLog.includes("fail")) {
        return "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]";
    }
    if (lowerLog.includes("high") || lowerLog.includes("warning")) {
        return "text-orange-400";
    }
    if (lowerLog.includes("medium")) {
        return "text-yellow-400";
    }
    if (lowerLog.includes("found") || lowerLog.includes("detected") || lowerLog.includes("vulnerability") || lowerLog.includes("init")) {
        return "text-cyan-300 font-semibold drop-shadow-[0_0_8px_rgba(103,232,249,0.3)]";
    }
    if (lowerLog.includes("success") || lowerLog.includes("complete")) {
        return "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]";
    }
    if (lowerLog.includes("crawl") || lowerLog.includes("spider")) {
        return "text-blue-300/80";
    }

    return "text-cyan-100/60";
}
