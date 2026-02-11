/**
 * Admin Reports — Placeholder for attendance export.
 */
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function AdminReports() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Reports</h1>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-10 border border-surface-200 text-center"
            >
                <FileText size={48} className="text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-surface-700 mb-2">Reports Module</h3>
                <p className="text-sm text-surface-400">
                    Attendance export and analytics will be available here.<br />
                    This feature is under development.
                </p>
            </motion.div>
        </div>
    )
}
