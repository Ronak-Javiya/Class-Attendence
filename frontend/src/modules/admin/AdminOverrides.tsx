/**
 * AdminOverrides — Override attendance decisions.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import api from '../../api/axios'
import { ShieldCheck, Loader2 } from 'lucide-react'

export default function AdminOverrides() {
    const [disputeId, setDisputeId] = useState('')
    const [newStatus, setNewStatus] = useState('PRESENT')
    const [reason, setReason] = useState('')

    const overrideMutation = useMutation({
        mutationFn: () =>
            api.post(`/disputes/override/${disputeId}`, { newStatus, reason }),
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Attendance Overrides</h1>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 border border-surface-200 max-w-lg"
            >
                <div className="flex items-center gap-2 mb-5">
                    <ShieldCheck size={18} className="text-purple-600" />
                    <h3 className="text-sm font-semibold text-surface-800">Admin Override</h3>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Dispute ID"
                        value={disputeId}
                        onChange={(e) => setDisputeId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Reason for override"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {overrideMutation.isSuccess && (
                    <p className="text-sm text-emerald-600 mt-3">Override applied successfully.</p>
                )}
                {overrideMutation.isError && (
                    <p className="text-sm text-red-600 mt-3">
                        {(overrideMutation.error as any)?.response?.data?.message || 'Override failed.'}
                    </p>
                )}

                <button
                    onClick={() => overrideMutation.mutate()}
                    disabled={!disputeId || !reason || overrideMutation.isPending}
                    className="mt-5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                    {overrideMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Apply Override
                </button>
            </motion.div>
        </div>
    )
}
