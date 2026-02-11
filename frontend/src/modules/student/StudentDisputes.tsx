/**
 * StudentDisputes — Raise and view disputes on ABSENT records.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import api from '../../api/axios'
import { AlertTriangle, Send, Loader2 } from 'lucide-react'

export default function StudentDisputes() {
    const queryClient = useQueryClient()
    const [entryId, setEntryId] = useState('')
    const [reason, setReason] = useState('')

    const { data: disputes, isLoading } = useQuery({
        queryKey: ['student-disputes'],
        queryFn: () => api.get('/disputes/my').then((r) => r.data.data),
    })

    const raiseMutation = useMutation({
        mutationFn: () => api.post('/disputes', { attendanceEntryId: entryId, reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-disputes'] })
            setEntryId('')
            setReason('')
        },
    })

    const statusColor: Record<string, string> = {
        OPEN: 'bg-amber-100 text-amber-700',
        FACULTY_APPROVED: 'bg-emerald-100 text-emerald-700',
        FACULTY_REJECTED: 'bg-red-100 text-red-700',
        ADMIN_OVERRIDDEN: 'bg-purple-100 text-purple-700',
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Attendance Disputes</h1>

            {/* Raise Dispute Form */}
            <div className="bg-white rounded-xl p-5 border border-surface-200 mb-8">
                <h3 className="text-sm font-semibold text-surface-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} /> Raise a Dispute
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Attendance Entry ID"
                        value={entryId}
                        onChange={(e) => setEntryId(e.target.value)}
                        className="px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                        type="text"
                        placeholder="Reason for dispute"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                {raiseMutation.isError && (
                    <p className="text-sm text-red-600 mb-3">
                        {(raiseMutation.error as any)?.response?.data?.message || 'Failed to raise dispute.'}
                    </p>
                )}
                <button
                    onClick={() => raiseMutation.mutate()}
                    disabled={!entryId || !reason || raiseMutation.isPending}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {raiseMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Submit Dispute
                </button>
            </div>

            {/* Disputes List */}
            <h2 className="text-lg font-semibold text-surface-800 mb-4">My Disputes</h2>
            {isLoading ? (
                <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
            ) : (
                <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
                    {(disputes ?? []).map((d: any) => (
                        <motion.div
                            key={d._id}
                            variants={listItemVariants}
                            className="bg-white rounded-lg p-4 border border-surface-200 flex items-center justify-between"
                        >
                            <div>
                                <p className="font-medium text-surface-800 text-sm">{d.reason}</p>
                                <p className="text-xs text-surface-400 mt-1">
                                    {new Date(d.createdAt).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[d.status] || 'bg-surface-100 text-surface-600'}`}>
                                {d.status}
                            </span>
                        </motion.div>
                    ))}
                    {!disputes?.length && (
                        <p className="text-sm text-surface-400 py-8 text-center">No disputes raised yet.</p>
                    )}
                </motion.div>
            )}
        </div>
    )
}
