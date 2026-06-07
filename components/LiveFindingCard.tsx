"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ExternalLink, Shield, Code, Lightbulb, Bug, Zap, BookOpen, Copy, Check } from "lucide-react";
import { useState } from "react";

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
    category?: string;
}

interface LiveFindingCardProps {
    finding: Finding;
    index: number;
}

// Vulnerability category mapping
const VULN_CATEGORIES: { [key: string]: { label: string; icon: string; color: string } } = {
    "sql_injection": { label: "Injection", icon: "💉", color: "text-red-400" },
    "blind_sqli": { label: "Injection", icon: "💉", color: "text-red-400" },
    "boolean_sqli": { label: "Injection", icon: "💉", color: "text-red-400" },
    "union_sqli": { label: "Injection", icon: "💉", color: "text-red-400" },
    "xss_reflected": { label: "XSS", icon: "⚡", color: "text-orange-400" },
    "dom_xss": { label: "XSS", icon: "⚡", color: "text-orange-400" },
    "rce": { label: "RCE", icon: "💀", color: "text-red-500" },
    "blind_rce": { label: "RCE", icon: "💀", color: "text-red-500" },
    "lfi": { label: "File Inclusion", icon: "📁", color: "text-amber-400" },
    "ssti": { label: "Template Injection", icon: "🎯", color: "text-purple-400" },
    "csti": { label: "Template Injection", icon: "🎯", color: "text-purple-400" },
    "bola": { label: "Access Control", icon: "🔓", color: "text-pink-400" },
    "bac": { label: "Access Control", icon: "🔓", color: "text-pink-400" },
    "cors_misconfig": { label: "CORS", icon: "🌐", color: "text-cyan-400" },
    "jwt_none": { label: "Authentication", icon: "🔑", color: "text-yellow-400" },
    "weak_crypto": { label: "Cryptography", icon: "🔐", color: "text-yellow-400" },
    "cookie_insecure": { label: "Session", icon: "🍪", color: "text-amber-400" },
    "security_header": { label: "Headers", icon: "📋", color: "text-blue-400" },
    "tech_stack": { label: "Info Disclosure", icon: "ℹ️", color: "text-blue-300" },
    "hidden_file": { label: "Sensitive Files", icon: "📄", color: "text-emerald-400" },
    "sensitive_data": { label: "Data Exposure", icon: "🔍", color: "text-rose-400" },
};

// Human-readable explanations
const getSimpleExplanation = (name: string): string => {
    const explanations: { [key: string]: string } = {
        "SQL Injection": "An attacker can inject malicious database commands through user input, potentially accessing or modifying all data in the database.",
        "Blind SQL Injection": "The database is vulnerable to SQL injection, but error messages are hidden. Attackers can still extract data using time delays or true/false conditions.",
        "Boolean SQL Injection": "The application responds differently to true vs false SQL conditions, allowing attackers to ask yes/no questions to extract data.",
        "UNION SQL Injection": "Attackers can combine their own queries with the application's query to extract data from other tables.",
        "Reflected XSS": "User input is reflected back in the page without sanitization, allowing attackers to inject malicious scripts that run in other users' browsers.",
        "DOM XSS": "JavaScript code uses untrusted data in dangerous ways (like innerHTML), allowing script injection through the DOM.",
        "Remote Code Execution": "⚠️ CRITICAL: Attackers can execute arbitrary commands on your server, potentially taking complete control.",
        "Blind RCE": "The server executes commands but doesn't show output. Attackers confirmed this using time-delay techniques.",
        "Local File Inclusion": "Attackers can read sensitive files from your server, including configuration files, source code, or password files.",
        "Server-Side Template Injection": "User input is processed by a template engine, allowing attackers to execute code on the server.",
        "Client-Side Template Injection": "Angular/Vue/React template expressions are processed unsafely, leading to XSS vulnerabilities.",
        "BOLA": "Objects (like user profiles) can be accessed by changing IDs in the URL. No proper authorization check exists.",
        "Broken Access Control": "Admin or privileged pages are accessible without proper authentication checks.",
        "CORS Misconfiguration": "Cross-Origin Resource Sharing is misconfigured, allowing any website to make requests to your API.",
        "JWT Analysis": "JSON Web Tokens found in cookies. Check for weak algorithms or missing signature verification.",
        "Cookie Security": "Session cookies are missing security flags, making them vulnerable to theft or manipulation.",
        "Missing Security Header": "Important HTTP security headers are missing, leaving the application vulnerable to various attacks.",
        "Technology Disclosure": "Server is revealing its technology stack, helping attackers find known vulnerabilities.",
        "Sensitive File Exposed": "Configuration files, backups, or version control data is publicly accessible.",
        "Sensitive Data Exposure": "API keys, passwords, or personal data found in responses.",
    };

    for (const [key, explanation] of Object.entries(explanations)) {
        if (name.toLowerCase().includes(key.toLowerCase())) {
            return explanation;
        }
    }
    return "This vulnerability could allow attackers to compromise the security of your application.";
};

// Quick fix suggestions
const getQuickFix = (name: string): string => {
    const fixes: { [key: string]: string } = {
        "sql": "Use parameterized queries or prepared statements. Never concatenate user input into SQL.",
        "xss": "Escape all user input before displaying. Use Content-Security-Policy header.",
        "rce": "Never pass user input to system commands. Use allowlists for any command execution.",
        "lfi": "Use a whitelist of allowed files. Never use user input in file paths directly.",
        "ssti": "Disable template evaluation in user input or use sandboxed template rendering.",
        "bola": "Implement proper authorization checks. Verify the user owns the requested resource.",
        "bac": "Add authentication middleware to all privileged routes. Deny by default.",
        "cors": "Specify allowed origins explicitly. Never reflect the Origin header or use wildcards.",
        "jwt": "Use strong algorithms (RS256/ES256). Always validate signatures server-side.",
        "cookie": "Add Secure, HttpOnly, and SameSite flags to all session cookies.",
        "header": "Add Content-Security-Policy, X-Frame-Options, and other security headers.",
        "file": "Block access to sensitive files in your web server configuration.",
    };

    const lowercaseName = name.toLowerCase();
    for (const [keyword, fix] of Object.entries(fixes)) {
        if (lowercaseName.includes(keyword)) {
            return fix;
        }
    }
    return "Review and sanitize all user inputs. Implement defense in depth.";
};

export function LiveFindingCard({ finding, index }: LiveFindingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const severityConfig = getSeverityConfig(finding.severity);
    const category = VULN_CATEGORIES[(finding.name || "").toLowerCase().replace(/\s+/g, "_")] || { label: "Security", icon: "🛡️", color: "text-gray-400" };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.23, 1, 0.32, 1]
            }}
            className="w-full"
        >
            <div
                className={`
                    relative overflow-hidden rounded-xl md:rounded-[20px] bg-[#1C1C1E] border border-white/5
                    hover:border-white/10 transition-all duration-300 cursor-pointer
                    ${severityConfig.glow}
                `}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Severity Accent Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${severityConfig.accentBg}`} />

                <div className="p-3 md:p-4 pl-4 md:pl-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${severityConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
                                <AlertTriangle className={`w-4 h-4 md:w-5 md:h-5 ${severityConfig.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                                    <span className={`
                                        px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider
                                        ${severityConfig.badgeBg} ${severityConfig.badgeText}
                                    `}>
                                        {finding.severity}
                                    </span>
                                    <span className={`text-[8px] md:text-[10px] ${category.color} flex items-center gap-1`}>
                                        <span>{category.icon}</span>
                                        <span className="hidden md:inline">{category.label}</span>
                                    </span>
                                    {finding.cwe && (
                                        <span className="text-[8px] md:text-[10px] text-white/30 font-mono hidden md:inline">{finding.cwe}</span>
                                    )}
                                </div>
                                <h3 className="text-white font-semibold text-xs md:text-sm truncate">{finding.name || "Unknown Vulnerability"}</h3>
                                <p className="text-white/40 text-[10px] md:text-xs truncate mt-0.5">{finding.url}</p>
                            </div>
                        </div>

                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                        >
                            <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                        </motion.div>
                    </div>

                    {/* Expanded Content */}
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 md:pt-4 space-y-3 border-t border-white/5 mt-3 md:mt-4">

                            {/* What This Means - Simple Explanation */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-lg p-3 border border-amber-500/20">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-amber-400/70 mb-1 font-semibold">What This Means</p>
                                        <p className="text-xs text-white/70 leading-relaxed">{getSimpleExplanation(finding.name || "")}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Evidence */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                                        <Bug className="w-3 h-3" /> Evidence
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(finding.evidence || ""); }}
                                        className="text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1"
                                    >
                                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                                <div className="bg-black/40 rounded-lg p-2.5 md:p-3 font-mono text-[10px] md:text-xs text-white/70 overflow-x-auto">
                                    {finding.evidence || "N/A"}
                                </div>
                            </div>

                            {/* Param & Payload */}
                            {(finding.param || finding.payload) && (
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                    {finding.param && (
                                        <div className="bg-cyan-500/5 rounded-lg p-2.5 border border-cyan-500/10">
                                            <p className="text-[9px] uppercase tracking-wider text-cyan-400/70 mb-1 flex items-center gap-1">
                                                <Zap className="w-2.5 h-2.5" /> Parameter
                                            </p>
                                            <code className="text-xs text-cyan-400 font-mono">{finding.param}</code>
                                        </div>
                                    )}
                                    {finding.payload && (
                                        <div className="bg-orange-500/5 rounded-lg p-2.5 border border-orange-500/10">
                                            <p className="text-[9px] uppercase tracking-wider text-orange-400/70 mb-1 flex items-center gap-1">
                                                <Code className="w-2.5 h-2.5" /> Payload
                                            </p>
                                            <code className="text-xs text-orange-400 font-mono truncate block">{finding.payload}</code>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quick Fix */}
                            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 rounded-lg p-3 border border-emerald-500/20">
                                <div className="flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1 font-semibold">Quick Fix</p>
                                        <p className="text-xs text-white/70 leading-relaxed">{getQuickFix(finding.name || "")}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                                <a
                                    href={finding.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Open URL
                                </a>
                                {finding.cwe && (
                                    <a
                                        href={`https://cwe.mitre.org/data/definitions/${finding.cwe.replace('CWE-', '')}.html`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <BookOpen className="w-3 h-3" />
                                        Learn More
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function getSeverityConfig(severity: string = "info") {
    switch ((severity || "info").toLowerCase()) {
        case "critical":
            return {
                accentBg: "bg-red-500",
                iconBg: "bg-red-500/20",
                iconColor: "text-red-400",
                badgeBg: "bg-red-500/20",
                badgeText: "text-red-400",
                badgeShadow: "shadow-red-500/20",
                glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
            };
        case "high":
            return {
                accentBg: "bg-orange-500",
                iconBg: "bg-orange-500/20",
                iconColor: "text-orange-400",
                badgeBg: "bg-orange-500/20",
                badgeText: "text-orange-400",
                badgeShadow: "shadow-orange-500/20",
                glow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]"
            };
        case "medium":
            return {
                accentBg: "bg-yellow-500",
                iconBg: "bg-yellow-500/20",
                iconColor: "text-yellow-400",
                badgeBg: "bg-yellow-500/20",
                badgeText: "text-yellow-400",
                badgeShadow: "shadow-yellow-500/20",
                glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
            };
        case "low":
            return {
                accentBg: "bg-blue-500",
                iconBg: "bg-blue-500/20",
                iconColor: "text-blue-400",
                badgeBg: "bg-blue-500/20",
                badgeText: "text-blue-400",
                badgeShadow: "shadow-blue-500/20",
                glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            };
        default: // Info
            return {
                accentBg: "bg-gray-500",
                iconBg: "bg-gray-500/20",
                iconColor: "text-gray-400",
                badgeBg: "bg-gray-500/20",
                badgeText: "text-gray-400",
                badgeShadow: "shadow-gray-500/20",
                glow: ""
            };
    }
}
