"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAllScans, getScanById, StoredScan } from "../../lib/scanStorage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Activity, Shield, AlertTriangle, CheckCircle, ChevronDown, Download, RefreshCw, X, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { HistorySkeleton } from "@/components/HistorySkeleton";
import { GlitchHeading } from "@/components/GlitchHeading";
import { createClient } from "@/lib/supabase/client";

export default function AnalyticsDashboard() {
    const [allScans, setAllScans] = useState<any[]>([]);
    const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
    const [selectedScan, setSelectedScan] = useState<any | null>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showAllFindings, setShowAllFindings] = useState(false);
    const [urlFilter, setUrlFilter] = useState<string | null>(null);
    const [historySearch, setHistorySearch] = useState("");

    const fetchScans = useCallback(async () => {
        // Only show loading if we have no data initially
        // setIsLoading(true); // REMOVED to prevent flash

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const url = userId
                ? `${apiUrl}/history?user_id=${userId}`
                : `${apiUrl}/history`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const scans = await response.json();
            console.log("Scans fetched:", scans); // DEBUG
            setAllScans(Array.isArray(scans) ? scans : []);

            // Set selection only if not set
            setSelectedScanId(prev => {
                if (!prev && Array.isArray(scans) && scans.length > 0) return scans[0].id;
                return prev;
            });
        } catch (error) {
            console.error("Failed to fetch scan history:", error);
            setAllScans([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString());
        fetchScans();

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchScans]);

    const handleExport = () => {
        if (!selectedScan) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        // Trigger download via hidden link
        const a = document.createElement("a");
        a.href = `${apiUrl}/report/${selectedScan.id}`;
        a.target = "_blank";
        a.download = "";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    useEffect(() => {
        const fetchScanDetails = async () => {
            if (!selectedScanId) return;
            setShowAllFindings(false);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const response = await fetch(`${apiUrl}/scan/${selectedScanId}`);
                const scanData = await response.json();
                setSelectedScan(scanData);
            } catch (error) {
                console.error("Failed to fetch scan details:", error);
            }
        };

        fetchScanDetails();
    }, [selectedScanId]);

    interface Finding {
        severity: string;
        url: string;
        type: string;
        [key: string]: any;
    }

    const rawFindings: Finding[] = selectedScan?.findings || [];
    const findings = urlFilter ? rawFindings.filter(f => f.url === urlFilter) : rawFindings;
    const stats = {
        total: findings.length,
        critical: findings.filter((f: Finding) => f.severity === "Critical").length,
        high: findings.filter((f: Finding) => f.severity === "High").length,
        medium: findings.filter((f: Finding) => f.severity === "Medium").length,
        low: findings.filter((f: Finding) => f.severity === "Low").length,
        info: findings.filter((f: Finding) => f.severity === "Info").length,
    };

    const severityData = [
        { name: "Critical", value: stats.critical, color: "#A855F7" }, // Purple
        { name: "High", value: stats.high, color: "#EF4444" },     // Red
        { name: "Medium", value: stats.medium, color: "#F59E0B" },   // Amber
        { name: "Low", value: stats.low, color: "#3B82F6" },      // Blue
        { name: "Info", value: stats.info, color: "#94A3B8" },     // Slate
    ];

    const crawledCount = selectedScan?.crawled_count || 0;
    const vulnerableUrlCount = new Set(findings.map((f: Finding) => f.url)).size;
    const urlData = [
        { name: "Vulnerable", value: vulnerableUrlCount, color: "#EF4444" },
        { name: "Clean", value: Math.max(0, crawledCount - vulnerableUrlCount), color: "#10B981" },
    ];

    // Loading handled inside main layout

    return (
        <div className="h-full w-full flex flex-col p-2 md:p-4 lg:p-6 pb-24 md:pb-6 relative overflow-hidden bg-black selection:bg-purple-500/30">
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
                <Sidebar activeItem="Dashboard" />



                {/* Main Content */}
                {isLoading ? <HistorySkeleton /> : (
                    <div className="flex-1 rounded-[12px] md:rounded-[20px] lg:rounded-[24px] bg-bg-inner relative overflow-y-auto glass-scrollbar p-3 md:p-6 lg:p-8 flex flex-col min-h-0">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 md:mb-10 shrink-0">
                            <div>
                                <div className="flex items-center gap-3 md:gap-4 mb-2">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                                        <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <GlitchHeading
                                            text="Command Center"
                                            className="text-xl md:text-3xl tracking-tight"
                                        />
                                        <div className="flex items-center gap-3 text-xs md:text-sm text-white/40 mt-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                                History Analysis
                                            </span>
                                            <span>•</span>
                                            <span className="font-mono">{currentTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 no-scrollbar shrink-0">
                                <button
                                    onClick={fetchScans}
                                    className="glass-button px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-medium flex items-center gap-2 hover:bg-white/15 whitespace-nowrap"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Refresh
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all whitespace-nowrap"
                                >
                                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Export PDF Report
                                </button>
                            </div>
                        </div>

                        {!selectedScan ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                                <p>No scan history available.</p>
                            </div>
                        ) : (
                            <>
                                {/* Metric Cards Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 shrink-0">
                                    {[
                                        { label: "Critical", value: stats.critical, color: "text-purple-400", glow: "bg-purple-500", icon: AlertTriangle },
                                        { label: "High Risk", value: stats.high, color: "text-red-400", glow: "bg-red-500", icon: Shield },
                                        { label: "Medium", value: stats.medium, color: "text-amber-400", glow: "bg-amber-500", icon: Activity },
                                        { label: "Low Risk", value: stats.low, color: "text-blue-400", glow: "bg-blue-500", icon: CheckCircle },
                                    ].map((card, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative overflow-hidden rounded-xl md:rounded-[24px] bg-bg-card/80 backdrop-blur-xl border border-white/5 p-4 md:p-6 group hover:border-white/10 transition-colors"
                                        >
                                            {/* Ambient Glow */}
                                            <div className={`absolute -left-4 -top-4 md:-left-6 md:-top-6 w-24 h-24 md:w-32 md:h-32 ${card.glow}/10 rounded-full blur-[40px] md:blur-[60px] group-hover:${card.glow}/20 transition-all duration-500`} />

                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div className="flex items-start justify-between mb-2 md:mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${card.glow} shadow-[0_0_8px_currentColor]`} />
                                                        <span className="text-[10px] md:text-xs font-semibold tracking-widest text-white/40 uppercase">{card.label}</span>
                                                    </div>
                                                    <card.icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
                                                </div>
                                                <div>
                                                    <p className={`text-3xl md:text-5xl font-bold font-mono ${card.color} drop-shadow-[0_0_15px_currentColor] mb-1`}>{card.value}</p>
                                                    <p className="text-[10px] md:text-xs text-white/30 font-medium tracking-wide">Active Findings</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Charts Section */}
                                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
                                    {/* Bar Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="lg:col-span-2 glass-panel rounded-2xl md:rounded-[32px] p-4 md:p-8"
                                    >
                                        <div className="flex items-center justify-between mb-4 md:mb-8">
                                            <h3 className="text-lg md:text-xl font-bold tracking-wide text-white/90">Severity Distribution</h3>
                                            <button className="glass-button p-1.5 md:p-2 rounded-xl">
                                                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white/60" />
                                            </button>
                                        </div>
                                        <div className="h-[200px] md:h-[300px] w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={severityData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                                        contentStyle={{
                                                            backgroundColor: "rgba(0,0,0,0.8)",
                                                            border: "1px solid rgba(255,255,255,0.1)",
                                                            borderRadius: "16px",
                                                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                                                            backdropFilter: "blur(10px)"
                                                        }}
                                                        itemStyle={{ color: "#fff" }}
                                                    />
                                                    <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={30}>
                                                        {severityData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </motion.div>

                                    {/* Donut Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="glass-panel rounded-2xl md:rounded-[32px] p-4 md:p-8"
                                    >
                                        <h3 className="text-lg md:text-xl font-bold tracking-wide text-white/90 mb-4 md:mb-8">Target Health</h3>
                                        <div className="h-[180px] md:h-[200px] relative w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={urlData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={70}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {urlData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Center Text */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-2xl md:text-3xl font-bold text-white">{selectedScan?.crawled_urls?.length || selectedScan?.crawled_count || 0}</span>
                                                <span className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">URLs</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                                            {urlData.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs md:text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                        <span className="text-white/60">{item.name}</span>
                                                    </div>
                                                    <span className="font-mono font-medium">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Vulnerabilities List */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass-panel rounded-2xl md:rounded-[32px] p-4 md:p-8 shrink-0"
                                >
                                    <div className="flex items-center justify-between mb-4 md:mb-6">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg md:text-xl font-semibold text-white/90">Recent Vulnerabilities</h3>
                                            {urlFilter && (
                                                <button
                                                    onClick={() => setUrlFilter(null)}
                                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors"
                                                >
                                                    <span className="max-w-[150px] truncate">{urlFilter}</span>
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowAllFindings(!showAllFindings)}
                                            className="text-xs md:text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            {showAllFindings ? "View Less" : "View All Analysis"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                                        {findings.length > 0 ? (
                                            findings.slice(0, (showAllFindings || urlFilter) ? undefined : 8).map((finding: Finding, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
                                                >
                                                    <div
                                                        className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-[0_0_10px_currentColor] flex-shrink-0"
                                                        style={{
                                                            color:
                                                                finding.severity === "Critical" ? "#A855F7" :
                                                                    finding.severity === "High" ? "#EF4444" :
                                                                        finding.severity === "Medium" ? "#F59E0B" :
                                                                            finding.severity === "Low" ? "#3B82F6" : "#6B7280",
                                                            backgroundColor: "currentColor"
                                                        }}
                                                    ></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs md:text-sm font-medium text-white/90 group-hover:text-white truncate transition-colors">{finding.name}</p>
                                                        <p
                                                            onClick={(e) => { e.stopPropagation(); setUrlFilter(finding.url); }}
                                                            className="text-[10px] md:text-xs text-white/40 truncate hover:text-cyan-400 hover:underline cursor-pointer transition-colors"
                                                            title="Filter by this URL"
                                                        >
                                                            {finding.url}
                                                        </p>
                                                    </div>
                                                    <div className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg bg-white/5 text-[10px] md:text-xs font-mono text-white/60 border border-white/5">
                                                        #{idx + 1}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-1 lg:col-span-2 py-8 md:py-12 text-center text-white/30 italic text-sm">
                                                No active threats detected in current view.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Bottom - All Scans History Grid */}
                                <div className="mt-8 md:mt-12 border-t border-white/10 pt-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
                                        <h3 className="text-lg md:text-xl font-light tracking-wide text-white/90">Scan Archive</h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                            <input
                                                type="text"
                                                placeholder="Search by URL..."
                                                value={historySearch}
                                                onChange={(e) => setHistorySearch(e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 w-full md:w-[250px] transition-all focus:bg-white/10"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {allScans
                                            .filter(scan => scan && (scan.target_url || scan.target || "").toLowerCase().includes(historySearch.toLowerCase()))
                                            .map(scan => (
                                                <div
                                                    key={scan.id}
                                                    onClick={() => {
                                                        setSelectedScanId(scan.id);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className={`p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden ${selectedScanId === scan.id ? 'ring-1 ring-cyan-500/50 bg-white/10' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-mono text-white/40">{new Date(scan.created_at || scan.timestamp || Date.now()).toLocaleDateString()}</span>
                                                        {scan.risk_score && (
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${scan.risk_score > 7 ? 'bg-red-500/20 text-red-400' :
                                                                scan.risk_score > 4 ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                Risk: {scan.risk_score}/10
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-white truncate mb-1">{scan.target_url || scan.target || "Unknown Target"}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-white/50">
                                                        <span>{scan.vulnerability_count || scan.findings?.length || 0} Findings</span>
                                                        <span>•</span>
                                                        <span>{scan.crawled_count || 0} URLs</span>
                                                    </div>
                                                </div>
                                            ))}
                                        {allScans.length === 0 && (
                                            <div className="col-span-full text-center py-8 text-white/30 italic">No historical scans found.</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
