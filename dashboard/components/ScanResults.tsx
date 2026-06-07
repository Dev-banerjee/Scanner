"use client";

import { useEffect, useState, useMemo } from "react";
import { AlertCircle, CheckCircle, Loader2, ShieldAlert, Code, Activity, Search, ChevronLeft, ChevronRight, Filter, Download } from "lucide-react";

interface ScanData {
    status: string;
    target: string;
    crawled_urls: string[];
    findings: Finding[];
    error?: string;
}

interface Finding {
    type: string;
    url: string;
    parameter?: string;
    payload?: string;
    severity: "Critical" | "High" | "Medium" | "Low" | "Info";
    evidence: string;
    description?: string;
    remediation?: string;
    cwe?: string;
}

export function ScanResults({ scanId }: { scanId: string }) {
    const [data, setData] = useState<ScanData | null>(null);
    const [filter, setFilter] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        let isMounted = true;
        const poll = async () => {
            try {
                const res = await fetch(`http://localhost:8000/scan/${scanId}`);
                if (!res.ok) throw new Error("Backend not ready");
                const result = await res.json();
                if (isMounted) setData(result);

                if (result.status !== "Completed" && result.status !== "Error") {
                    setTimeout(poll, 2000);
                }
            } catch (error) {
                console.error("Polling error:", error);
                // Retry even on error (backend might be restarting)
                if (isMounted) setTimeout(poll, 3000);
            }
        };
        poll();
        return () => { isMounted = false; };
    }, [scanId]);

    // Derived state for filtering and pagination
    const { filteredFindings, counts } = useMemo(() => {
        if (!data) return { filteredFindings: [], counts: {} };

        const findings = data.findings || [];

        // Calculate counts for tabs
        const c: Record<string, number> = { All: findings.length };
        ["Critical", "High", "Medium", "Low", "Info"].forEach(s => {
            c[s] = findings.filter(f => f.severity === s).length;
        });

        // Filter
        let filtered = findings;
        if (filter !== "All") {
            filtered = filtered.filter(f => f.severity === filter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.type.toLowerCase().includes(q) ||
                f.url.toLowerCase().includes(q)
            );
        }

        return { filteredFindings: filtered, counts: c };
    }, [data, filter, searchQuery]);

    // Pagination slice
    const paginatedFindings = filteredFindings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredFindings.length / itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    if (!data) return (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-cyan-500" />
            <p className="font-mono animate-pulse">Initializing Scanner...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatusCard label="Current Status" value={data.status} icon={<ActivityIcon status={data.status} />} active={data.status === "Scanning"} />
                <StatusCard label="Attack Surface" value={`${data.crawled_urls?.length || 0} URLs`} icon={<Code className="w-5 h-5" />} />
                <StatusCard label="Total Findings" value={`${data.findings?.length || 0} Issues`} icon={<ShieldAlert className="w-5 h-5" />} danger={(data.findings?.length || 0) > 0} />
                <StatusCard label="Critical/High" value={`${(counts["Critical"] || 0) + (counts["High"] || 0)} Issues`} icon={<AlertCircle className="w-5 h-5" />} danger={(counts["Critical"] || 0) > 0} />
            </div>

            {/* Main Content Area */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-6">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-cyan-500" />
                        Vulnerability Report
                    </h3>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Download Report Button */}
                        {data.status === "Completed" && (
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/report/${scanId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-cyan-950/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400/50 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </a>
                        )}

                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search findings..."
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4">
                    {["All", "Critical", "High", "Medium", "Low", "Info"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setFilter(tab); setCurrentPage(1); }}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${filter === tab
                                    ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'}
                            `}
                        >
                            {tab}
                            <span className={`
                                text-xs px-1.5 py-0.5 rounded-full ml-1
                                ${filter === tab ? 'bg-neutral-950 text-neutral-300' : 'bg-neutral-800 text-neutral-500'}
                            `}>
                                {counts[tab] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Findings Grid */}
                {paginatedFindings.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-950/30 rounded-xl border border-neutral-800/50 border-dashed">
                        {data.status === "Completed" && data.findings.length === 0 ? (
                            <>
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-neutral-200">System Secure</h4>
                                <p className="text-neutral-500">No vulnerabilities detected matching current criteria.</p>
                            </>
                        ) : (
                            <p className="text-neutral-500">No findings match your filter/search.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {paginatedFindings.map((finding, i) => (
                            <FindingCard key={`${currentPage}-${i}`} finding={finding} />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredFindings.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                        <span className="text-xs text-neutral-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFindings.length)} of {filteredFindings.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 hover:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-neutral-400" />
                            </button>
                            <span className="flex items-center px-4 text-sm font-mono text-neutral-400 bg-neutral-950 rounded-lg border border-neutral-800">
                                Page {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 hover:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ... unchanged StatusCard and ActivityIcon ...
interface StatusCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    active?: boolean;
    danger?: boolean;
}

function StatusCard({ label, value, icon, active = false, danger = false }: StatusCardProps) {
    return (
        <div className={`
      relative overflow-hidden p-5 rounded-xl border
      ${active ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-neutral-800 bg-neutral-900/50'}
      ${danger ? 'border-red-500/50 bg-red-950/10' : ''}
    `}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">{label}</span>
                <span className={`${active ? 'text-cyan-400' : 'text-neutral-500'} ${danger ? 'text-red-400' : ''}`}>
                    {icon}
                </span>
            </div>
            <div className="text-2xl font-bold text-neutral-100 flex items-center gap-2">
                {value}
                {active && <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />}
            </div>
        </div>
    );
}

function ActivityIcon({ status }: { status: string }) {
    if (status === "Crawling") return <Loader2 className="w-5 h-5 animate-spin" />;
    if (status === "Scanning") return <ShieldAlert className="w-5 h-5 animate-pulse" />;
    if (status === "Completed") return <CheckCircle className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
}

function FindingCard({ finding }: { finding: Finding }) {
    const colors = {
        Critical: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        High: "bg-red-500/10 text-red-400 border-red-500/30",
        Medium: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        Info: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };

    return (
        <div className="group bg-neutral-950 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition-all shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-widest ${colors[finding.severity]}`}>
                        {finding.severity}
                    </span>
                    <h4 className="text-base font-bold text-neutral-200">{finding.type}</h4>
                    {finding.cwe && <span className="text-xs text-neutral-500 font-mono border-l border-neutral-800 pl-3">{finding.cwe}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Description & Remediation (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    <div>
                        <p className="text-sm text-neutral-400 leading-relaxed">{finding.description}</p>
                    </div>
                </div>

                {/* Right Column: Evidence (5 cols) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-2 font-mono text-xs">
                    <div className="bg-neutral-900 p-2 rounded border border-neutral-800/50 flex items-center justify-between">
                        <span className="text-neutral-500 uppercase font-bold text-[10px]">URL</span>
                        <span className="text-cyan-400 truncate max-w-[250px]" title={finding.url}>{finding.url}</span>
                    </div>

                    {(finding.parameter || finding.payload) && (
                        <div className="bg-neutral-900 p-2 rounded border border-neutral-800/50 flex flex-wrap gap-x-4 gap-y-1">
                            {finding.parameter && <span className="text-yellow-500">PARAM: <span className="text-neutral-300">{finding.parameter}</span></span>}
                            {finding.payload && <span className="text-red-400">PAYLOAD: <span className="text-neutral-300">{finding.payload}</span></span>}
                        </div>
                    )}

                    <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800/50">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Evidence</span>
                        <code className="text-neutral-400 block whitespace-pre-wrap break-all max-h-20 overflow-y-auto custom-scrollbar">
                            {finding.evidence}
                        </code>
                    </div>
                </div>
            </div>

            {/* Quick Fix Footer */}
            {finding.remediation && (
                <div className="mt-4 pt-3 border-t border-neutral-900 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500/50 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-400/80">
                        <span className="font-bold text-emerald-500/90 uppercase text-[10px] mr-2">Fix:</span>
                        {finding.remediation}
                    </p>
                </div>
            )}
        </div>
    );
}
