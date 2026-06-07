'use client'

import React from 'react'

interface StatsCardsProps {
    totalIssues: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    infoCount: number
}

export default function StatsCards({
    totalIssues,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount
}: StatsCardsProps) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Total Issues</h3>

            <div className="space-y-3">
                {/* Total */}
                <div className="text-3xl font-bold text-gray-900 mb-4">
                    {totalIssues}
                </div>

                {/* Critical */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <span className="text-sm text-gray-600">Critical</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{criticalCount}</span>
                </div>

                {/* High risk */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span className="text-sm text-gray-600">High risk</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{highCount}</span>
                </div>

                {/* Medium risk */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-gray-600">Medium risk</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{mediumCount}</span>
                </div>

                {/* Low risk */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Low risk</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{lowCount}</span>
                </div>

                {/* Information */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-sm text-gray-600">Information</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{infoCount}</span>
                </div>
            </div>
        </div>
    )
}
