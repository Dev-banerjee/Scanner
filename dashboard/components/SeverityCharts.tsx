'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { StoredScan } from '../lib/scanStorage'

interface SeverityChartsProps {
    scan: StoredScan | null
    allScans: StoredScan[]
}

export default function SeverityCharts({ scan, allScans }: SeverityChartsProps) {

    // 1. Issues by Severity (Bar Chart)
    const getSeverityData = () => {
        if (!scan) return []

        const findings = scan.findings
        const severities = ['Critical', 'High', 'Medium', 'Low', 'Info']

        return severities.map(severity => ({
            name: severity,
            count: findings.filter(f => f.severity === severity).length
        }))
    }

    // 2. Severity Trend (Line Chart) - Shows trend across last 10 scans
    const getTrendData = () => {
        const recent = allScans.slice(0, 10).reverse()

        return recent.map((s, idx) => ({
            scan: `Scan ${idx + 1}`,
            Critical: s.findings.filter(f => f.severity === 'Critical').length,
            High: s.findings.filter(f => f.severity === 'High').length,
            Medium: s.findings.filter(f => f.severity === 'Medium').length,
            Low: s.findings.filter(f => f.severity === 'Low').length,
            Info: s.findings.filter(f => f.severity === 'Info').length,
        }))
    }

    // 3. Scanned URLs (Donut Chart)
    const getUrlData = () => {
        if (!scan) return []

        const totalUrls = scan.crawledUrls.length
        const urlsWithIssues = new Set(scan.findings.map(f => f.url)).size
        const urlsWithoutIssues = totalUrls - urlsWithIssues

        return [
            { name: 'URLs with issues', value: urlsWithIssues, color: '#EF4444' },
            { name: 'URLs without issues', value: urlsWithoutIssues, color: '#1E3A8A' },
        ]
    }

    const severityColors: Record<string, string> = {
        Critical: '#9333EA',
        High: '#EF4444',
        Medium: '#F97316',
        Low: '#3B82F6',
        Info: '#6B7280'
    }

    if (!scan) {
        return (
            <div className="text-center text-gray-500 py-12">
                Select a scan from the sidebar to view charts
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Issues by Severity Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Issues by Severity</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSeverityData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6">
                            {getSeverityData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={severityColors[entry.name]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 2. Severity Trend Line Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Severity Trend</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="scan" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Critical" stroke="#9333EA" strokeWidth={2} />
                        <Line type="monotone" dataKey="High" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="Medium" stroke="#F97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="Low" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="Info" stroke="#6B7280" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 3. Scanned URLs Donut Chart */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Scanned URLs</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center">
                    <ResponsiveContainer width="50%" height={250}>
                        <PieChart>
                            <Pie
                                data={getUrlData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                dataKey="value"
                            >
                                {getUrlData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="flex-1 space-y-3">
                        {getUrlData().map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-semibold">{item.value}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total URLs scanned</span>
                                <span className="text-sm font-bold">{scan.crawledUrls.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
