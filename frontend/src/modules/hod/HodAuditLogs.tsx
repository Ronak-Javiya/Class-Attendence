/**
 * HodAuditLogs — Immutable audit log viewer.
 */
import { motion } from 'framer-motion'
import { ScrollText } from 'lucide-react'

// Since audit log API would need to be added, this is a placeholder
// that shows the UI structure for when the API is ready.
export default function HodAuditLogs() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Audit Logs</h1>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-10 border border-surface-200 text-center"
            >
                <ScrollText size={48} className="text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-surface-700 mb-2">Immutable Audit Trail</h3>
                <p className="text-sm text-surface-400">
                    All attendance modifications, disputes, and overrides are permanently logged.<br />
                    Connect the audit log API to view the full trail.
                </p>
            </motion.div>
        </div>
    )
}
