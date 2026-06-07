// Scan Storage Manager for LocalStorage
// Saves and retrieves scan history for analytics dashboard

export interface Finding {
    name: string
    severity: string
    url: string
    evidence: string
    param?: string
    payload?: string
    cwe?: string
    description?: string
    remediation?: string
}

export interface StoredScan {
    id: string
    target: string
    timestamp: number
    duration: number
    crawledUrls: string[]
    findings: Finding[]
    status: 'Completed' | 'Running' | 'Scanning' | 'Error'
    maxPages?: number
    stealthMode?: boolean
    config?: {
        stealth: boolean
        auth?: string
    }
}

const STORAGE_KEY = 'scancrypt_scan_history'

/**
 * Save a scan to LocalStorage
 */
export const saveScan = (scan: StoredScan): void => {
    try {
        const existing = getAllScans()

        // Check if scan already exists (update it)
        const index = existing.findIndex(s => s.id === scan.id)
        if (index !== -1) {
            existing[index] = scan
        } else {
            existing.push(scan)
        }

        // Keep only last 50 scans (storage limit)
        const limited = existing.slice(-50)

        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
    } catch (error) {
        console.error('Failed to save scan:', error)
    }
}

/**
 * Get all scans from LocalStorage
 */
export const getAllScans = (): StoredScan[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return []

        const scans = JSON.parse(data) as StoredScan[]

        // Sort by timestamp (newest first)
        return scans.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
        console.error('Failed to load scans:', error)
        return []
    }
}

/**
 * Get a single scan by ID
 */
export const getScanById = (id: string): StoredScan | null => {
    try {
        const scans = getAllScans()
        return scans.find(s => s.id === id) || null
    } catch (error) {
        console.error('Failed to get scan:', error)
        return null
    }
}

/**
 * Delete a scan by ID
 */
export const deleteScan = (id: string): void => {
    try {
        const scans = getAllScans()
        const filtered = scans.filter(s => s.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
        console.error('Failed to delete scan:', error)
    }
}

/**
 * Clear all scan history
 */
export const clearAllScans = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear scans:', error)
    }
}

/**
 * Get scan statistics
 */
export const getScanStats = () => {
    const scans = getAllScans()

    const totalScans = scans.length
    const completedScans = scans.filter(s => s.status === 'Completed').length

    // Aggregate all findings
    const allFindings = scans.flatMap(s => s.findings)

    const criticalCount = allFindings.filter(f => f.severity === 'Critical').length
    const highCount = allFindings.filter(f => f.severity === 'High').length
    const mediumCount = allFindings.filter(f => f.severity === 'Medium').length
    const lowCount = allFindings.filter(f => f.severity === 'Low').length
    const infoCount = allFindings.filter(f => f.severity === 'Info').length

    return {
        totalScans,
        completedScans,
        totalFindings: allFindings.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        infoCount
    }
}
