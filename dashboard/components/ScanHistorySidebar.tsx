'use client'

import React from 'react'
import { StoredScan } from '../lib/scanStorage'

interface ScanHistorySidebarProps {
    scans: StoredScan[]
    selectedScanId: string | null
    onSelectScan: (scanId: string) => void
}

export default function ScanHistorySidebar({
    scans,
    selectedScanId,
    onSelectScan
}: ScanHistorySidebarProps) {

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    const formatDuration = (duration: number) => {
        const minutes = Math.floor(duration / 60000)
        const seconds = Math.floor((duration % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-blue-500'
            case 'Running': return 'bg-yellow-500'
            case 'Error': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-semibold">My Scans</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{scans.length} total</div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
                <select className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Most recent</option>
                    <option>Oldest first</option>
                    <option>Most issues</option>
                </select>
            </div>

            {/* Scan List */}
            <div className="p-2">
                {scans.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No scans yet.<br />
                        Run a scan to see history.
                    </div>
                ) : (
                    scans.map((scan) => (
                        <button
                            key={scan.id}
                            onClick={() => onSelectScan(scan.id)}
                            className={`w-full text-left px-3 py-3 mb-2 rounded hover:bg-gray-100 transition ${selectedScanId === scan.id ? 'bg-blue-50 border border-blue-300' : 'bg-white border border-gray-200'
                                }`}
                        >
                            {/* Status indicator */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(scan.status)}`}></div>
                                <span className="text-xs font-medium text-gray-900 truncate">
                                    {new URL(scan.target).hostname}
                                </span>
                            </div>

                            {/* Date and Duration */}
                            <div className="text-xs text-gray-500 space-y-1">
                                <div>{formatDate(scan.timestamp)}</div>
                                <div className="flex items-center justify-between">
                                    <span>{formatDuration(scan.duration)}</span>
                                    <span className="font-semibold text-gray-700">
                                        {scan.findings.length} issues
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
