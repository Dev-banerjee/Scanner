"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Clock, Target, CheckCircle2, Database, Zap, Lock, Key, Info, Layers } from "lucide-react";
import { MacTerminal } from "@/components/MacTerminal";
import { LiveFindingCard } from "@/components/LiveFindingCard";
import { Sidebar } from "@/components/Sidebar";
import { GlitchHeading } from "@/components/GlitchHeading";

interface Finding {
    name: string;
    severity: string;
    url: string;
    evidence: string;
    param?: string;
    payload?: string;
    cwe?: string;
    description?: string;
    remediation?: string;
}

interface ScanStatus {
    status: string;
    crawled_urls: string[];
    findings: Finding[];
    logs?: string[];
    duration?: number;
}

import { Suspense } from "react";

function LiveActivityContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const scanId = searchParams.get("scanId");

    const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [severityFilter, setSeverityFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const [scanIdState, setScanIdState] = useState<string | null>(null);
    const processedRef = useRef<Set<string>>(new Set());

    // Elapsed time counter
    useEffect(() => {
        if (isComplete) return;
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, isComplete]);

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Poll for scan status
    const fetchStatus = useCallback(async () => {
        const currentId = scanId || scanIdState;
        if (!currentId) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/scan/${currentId}`);
            const data: ScanStatus = await res.json();
            setScanStatus(data);

            const newLogs: string[] = [];
            const seen = processedRef.current;

            // Update logs with new crawled URLs
            data.crawled_urls?.forEach((url) => {
                const logEntry = `[CRAWL] Discovered: ${url}`;
                if (!seen.has(logEntry)) {
                    seen.add(logEntry);
                    newLogs.push(logEntry);
                }
            });

            // Add finding logs
            data.findings?.forEach((finding) => {
                const logEntry = `[${(finding.severity || "INFO").toUpperCase()}] Found: ${finding.name || "Vulnerability"} at ${finding.url}`;
                if (!seen.has(logEntry)) {
                    seen.add(logEntry);
                    newLogs.push(logEntry);
                }
            });

            if (newLogs.length > 0) {
                setLogs((prev) => [...prev, ...newLogs]);
            }

            // Update findings
            setFindings(data.findings || []);

            // Check if complete
            if (data.status === "Completed" || data.status === "Error") {
                setIsComplete(true);
                const finalMsg = data.status === "Completed"
                    ? `[SUCCESS] Scan completed. Found ${data.findings?.length || 0} vulnerabilities.`
                    : `[ERROR] Scan failed.`;

                if (!seen.has(finalMsg)) {
                    seen.add(finalMsg);
                    setLogs((prev) => [...prev, finalMsg]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch status:", error);
        }
    }, [scanId, scanIdState]); // Removed 'logs' dependency

    useEffect(() => {
        // If scanId provided in URL, use it
        if (scanId) {
            if (!processedRef.current.has(`INIT-${scanId}`)) {
                setLogs([`[INIT] Starting scan for target...`, `[INFO] Scan ID: ${scanId}`]);
                processedRef.current.add(`INIT-${scanId}`);
            }

            const interval = setInterval(fetchStatus, 1500);
            fetchStatus();
            return () => clearInterval(interval);
        }

        // If no scanId, try to get the latest one from localStorage
        try {
            const savedScans = localStorage.getItem('scancrypt_scan_history');
            if (savedScans) {
                const parsed = JSON.parse(savedScans);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const latest = parsed.sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)[0];
                    if (latest && latest.id) {
                        setScanIdState(latest.id); // Triggers re-render to start polling
                        // Update URL without full reload if possible, or just let state handle it
                        window.history.replaceState(null, "", `/live-activity?scanId=${latest.id}`);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to recover last scan", e);
        }
    }, [scanId, fetchStatus]);

    // Effect to start polling if scanIdState is set (when recovered from storage)
    useEffect(() => {
        if (!scanIdState) return;

        const interval = setInterval(fetchStatus, 1500);
        fetchStatus();
        return () => clearInterval(interval);
    }, [scanIdState, fetchStatus]);

    // Stats
    const criticalCount = findings.filter((f) => f.severity?.toLowerCase() === "critical").length;
    const highCount = findings.filter((f) => f.severity?.toLowerCase() === "high").length;
    const mediumCount = findings.filter((f) => f.severity?.toLowerCase() === "medium").length;
    const lowCount = findings.filter((f) => f.severity?.toLowerCase() === "low").length;

    // Category mapping
    const getCategory = (name: string): string => {
        if (!name) return "other";
        const lowName = name.toLowerCase();
        if (lowName.includes("sql")) return "injection";
        if (lowName.includes("xss")) return "xss";
        if (lowName.includes("rce") || lowName.includes("command")) return "rce";
        if (lowName.includes("lfi") || lowName.includes("file inclusion")) return "lfi";
        if (lowName.includes("ssti") || lowName.includes("csti") || lowName.includes("template")) return "template";
        if (lowName.includes("bola") || lowName.includes("idor") || lowName.includes("bac") || lowName.includes("access")) return "access";
        if (lowName.includes("cors")) return "cors";
        if (lowName.includes("jwt") || lowName.includes("auth") || lowName.includes("cookie") || lowName.includes("session")) return "auth";
        if (lowName.includes("header") || lowName.includes("tech") || lowName.includes("disclosure")) return "info";
        if (lowName.includes("ssl") || lowName.includes("tls") || lowName.includes("policy") || lowName.includes("options")) return "info";
        if (lowName.includes("clickjacking")) return "info";
        return "other";
    };

    // Category counts
    const injectionCount = findings.filter((f) => getCategory(f.name) === "injection").length;
    const xssCount = findings.filter((f) => getCategory(f.name) === "xss").length;
    const accessCount = findings.filter((f) => getCategory(f.name) === "access").length;
    const authCount = findings.filter((f) => getCategory(f.name) === "auth").length;
    const infoCount = findings.filter((f) => getCategory(f.name) === "info").length;
    const otherCount = findings.filter((f) => getCategory(f.name) === "other").length;

    // Filtered findings based on severity + category filter
    const filteredFindings = findings.filter((f) => {
        const severityMatch = severityFilter === "all" || f.severity?.toLowerCase() === severityFilter.toLowerCase();
        const categoryMatch = categoryFilter === "all" || getCategory(f.name) === categoryFilter;
        return severityMatch && categoryMatch;
    });

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
                <Sidebar activeItem="Live Activity" />

                {/* Main Content */}
                <div className="flex-1 rounded-[12px] md:rounded-[20px] lg:rounded-[24px] bg-bg-inner relative overflow-y-auto lg:overflow-hidden p-3 md:p-6 lg:p-8 flex flex-col min-h-0">

                    {/* Header - Mobile Optimized */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 md:mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                            </div>
                            <div>
                                <GlitchHeading
                                    text="Live Scan"
                                    className="text-xl md:text-3xl tracking-tight"
                                />
                                <div className="flex items-center gap-2 text-xs md:text-sm text-white/40 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        {isComplete ? "Done" : "Scanning"}
                                    </span>
                                    <span>•</span>
                                    <span className="font-mono">{formatTime(elapsedTime)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push("/")}
                            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-medium flex items-center gap-2 transition-all ${isComplete
                                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                : "bg-white/5 text-white/40"
                                }`}
                            disabled={!isComplete}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {isComplete ? "Complete" : "Scanning..."}
                        </button>
                    </div>

                    {/* Stats Row - Compact on Mobile */}
                    <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                        <StatCard
                            icon={Target}
                            label="URLs"
                            value={scanStatus?.crawled_urls?.length || 0}
                            color="text-cyan-400"
                            glow="bg-cyan-500"
                        />
                        <StatCard
                            icon={Shield}
                            label="Total Vulns"
                            value={findings?.length || 0}
                            color="text-purple-400"
                            glow="bg-purple-500"
                        />
                        <StatCard
                            label="Crit/High"
                            value={`${criticalCount}/${highCount}`}
                            color="text-red-400"
                            glow="bg-red-500"
                            icon={Activity}
                        />
                        <StatCard
                            label="Medium/Low"
                            value={`${mediumCount}/${lowCount}`}
                            color="text-amber-400"
                            glow="bg-amber-500"
                            icon={Activity}
                        />
                    </div>

                    {/* Split View - Stacked on Mobile, Side-by-side on Desktop */}
                    <div className="flex-none lg:flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-3 md:gap-4 lg:min-h-0 lg:overflow-hidden">
                        {/* Terminal Column - Smaller height on mobile */}
                        <div className="flex flex-col h-[200px] md:h-[300px] lg:h-full bg-bg-base rounded-xl md:rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="flex-1 overflow-hidden">
                                <MacTerminal
                                    logs={logs}
                                    isRunning={!isComplete}
                                    title={`Output`}
                                />
                            </div>
                        </div>

                        {/* Live Findings Column */}
                        <div className="flex flex-col lg:flex-1 lg:h-full lg:overflow-hidden mt-4 lg:mt-0">
                            <div className="flex flex-col gap-2 mb-2 md:mb-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm md:text-lg font-semibold text-white/90">Findings</h3>
                                    <span className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded-full bg-white/5 text-white/40 border border-white/5">{filteredFindings?.length || 0}</span>
                                </div>

                                {/* Severity Filters */}
                                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                    {[
                                        { key: "all", label: "All", color: "bg-white/10 text-white" },
                                        { key: "critical", label: `⚠️ ${criticalCount}`, color: "bg-purple-500/20 text-purple-400" },
                                        { key: "high", label: `🔴 ${highCount}`, color: "bg-red-500/20 text-red-400" },
                                        { key: "medium", label: `🟡 ${mediumCount}`, color: "bg-amber-500/20 text-amber-400" },
                                        { key: "low", label: `🔵 ${lowCount}`, color: "bg-blue-500/20 text-blue-400" },
                                        { key: "info", label: `ℹ️ ${findings.filter(f => f.severity?.toLowerCase() === "info").length}`, color: "bg-gray-500/20 text-gray-400" },
                                    ].map((filter) => (
                                        <button
                                            key={filter.key}
                                            onClick={() => setSeverityFilter(severityFilter === filter.key ? "all" : filter.key)}
                                            className={`text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${severityFilter === filter.key
                                                ? `${filter.color} border border-current`
                                                : "bg-white/5 text-white/40 hover:bg-white/10 border border-transparent"
                                                }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Category Filters */}
                                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                    {[
                                        { key: "all", label: "All Types", icon: Layers },
                                        { key: "injection", label: `SQLi`, icon: Database, count: injectionCount },
                                        { key: "xss", label: `XSS`, icon: Zap, count: xssCount },
                                        { key: "access", label: `Access`, icon: Lock, count: accessCount },
                                        { key: "auth", label: `Auth`, icon: Key, count: authCount },
                                        { key: "info", label: `Info`, icon: Info, count: infoCount },
                                        { key: "other", label: `Other`, icon: Layers, count: otherCount },
                                    ].map((filter) => (
                                        <button
                                            key={filter.key}
                                            onClick={() => setCategoryFilter(categoryFilter === filter.key ? "all" : filter.key)}
                                            className={`text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${categoryFilter === filter.key
                                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                : "bg-white/5 text-white/40 hover:bg-white/10 border border-transparent"
                                                }`}
                                        >
                                            <filter.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            <span>{filter.label}</span>
                                            {filter.count !== undefined && filter.count > 0 && (
                                                <span className="text-[8px] bg-white/10 px-1 rounded">{filter.count}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:flex-1 lg:overflow-y-auto glass-scrollbar pr-1 md:pr-2 space-y-2 md:space-y-3 pb-2">
                                <AnimatePresence mode="popLayout">
                                    {(!filteredFindings || filteredFindings.length === 0) ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="h-full flex flex-col items-center justify-center text-white/30 bg-white/5 rounded-[24px] border border-white/5 border-dashed min-h-[200px]"
                                        >
                                            <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="text-sm font-medium opacity-60">{(findings?.length || 0) > 0 ? "No matches for filter" : "Waiting for findings..."}</p>
                                        </motion.div>
                                    ) : (
                                        filteredFindings.map((finding, index) => (
                                            <LiveFindingCard
                                                key={`${finding.name}-${finding.url}-${index}`}
                                                finding={finding}
                                                index={index}
                                            />
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function LiveActivityPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-10 h-10 text-cyan-500 animate-pulse" />
                    <p className="text-sm text-white/50 font-mono">Initializing Neural Protocol...</p>
                </div>
            </div>
        }>
            <LiveActivityContent />
        </Suspense>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    glow
}: {
    icon?: any;
    label: string;
    value: number | string;
    color: string;
    glow: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-xl md:rounded-[20px] bg-bg-card/80 backdrop-blur-xl border border-white/5 p-3 md:p-4 group hover:border-white/10 transition-colors h-full min-h-[80px] md:min-h-[100px] flex flex-col justify-between">
            {/* Ambient Glow */}
            <div className={`absolute -left-3 -top-3 md:-left-4 md:-top-4 w-16 h-16 md:w-24 md:h-24 ${glow}/10 rounded-full blur-[30px] md:blur-[40px] group-hover:${glow}/20 transition-all duration-500`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-1">
                    <span className="text-[10px] md:text-xs font-semibold tracking-widest text-white/40 uppercase truncate max-w-[80%]">{label}</span>
                    {Icon && <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${color} opacity-80`} />}
                </div>
                <div>
                    <p className={`text-xl md:text-2xl lg:text-3xl font-bold font-mono ${color} drop-shadow-[0_0_10px_currentColor] truncate`}>{value}</p>
                </div>
            </div>
        </div>
    );
}
