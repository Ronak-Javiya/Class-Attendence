/**
 * FacultyDisputes — Review and resolve student disputes.
 */
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import api from '../../api/axios'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function FacultyDisputes() {
    const queryClient = useQueryClient()

    // Faculty needs to pick a class to see disputes — simplified: show all for now
    const { data: classes } = useQuery({
        queryKey: ['faculty-classes'],
        queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
    })

    const firstClassId = classes?.[0]?._id

    const { data: disputes, isLoading } = useQuery({
        queryKey: ['faculty-disputes', firstClassId],
        queryFn: () => api.get(`/disputes/class/${firstClassId}`).then((r) => r.data.data),
        enabled: !!firstClassId,
    })

    const resolveMutation = useMutation({
        mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
            api.post(`/disputes/${id}/resolve`, { resolution }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty-disputes'] }),
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Dispute Review</h1>

            {isLoading ? (
                <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-lg" />)}</div>
            ) : (
                <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
                    {(disputes ?? []).map((d: any) => (
                        <motion.div
                            key={d._id}
                            variants={listItemVariants}
                            className="bg-white rounded-xl p-5 border border-surface-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-medium text-surface-800">Dispute: {d.reason}</p>
                                    <p className="text-xs text-surface-400 mt-1">
                                        Student: {d.studentId?.name || d.studentId} •{' '}
                                        {new Date(d.createdAt).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                                    {d.status}
                                </span>
                            </div>

                            {d.status === 'OPEN' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => resolveMutation.mutate({ id: d._id, resolution: 'APPROVE' })}
                                        disabled={resolveMutation.isPending}
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                                    >
                                        {resolveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => resolveMutation.mutate({ id: d._id, resolution: 'REJECT' })}
                                        disabled={resolveMutation.isPending}
                                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"
                                    >
                                        <XCircle size={14} /> Reject
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {!disputes?.length && (
                        <p className="text-sm text-surface-400 text-center py-8">No open disputes.</p>
                    )}
                </motion.div>
            )}
        </div>
    )
}
