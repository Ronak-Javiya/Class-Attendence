import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listVariants } from '../../shared/motion/variants'
import api from '../../api/axios'
import { CheckCircle, XCircle, Loader2, BookOpen, Send } from 'lucide-react'

export default function HodApprovals() {
    const queryClient = useQueryClient()
    const [actionId, setActionId] = useState<string | null>(null)
    const [rejectionId, setRejectionId] = useState<string | null>(null)
    const [reason, setReason] = useState('')

    const { data: classes, isLoading } = useQuery({
        queryKey: ['hod-classes'],
        queryFn: () => api.get('/classes?role=HOD').then((r) => r.data.data),
    })

    const approveMutation = useMutation({
        mutationFn: (id: string) => {
            setActionId(id)
            return api.post(`/classes/${id}/approve`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hod-classes'] })
            setActionId(null)
        },
    })

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => {
            setActionId(id)
            return api.post(`/classes/${id}/reject`, { reason })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hod-classes'] })
            setActionId(null)
            setRejectionId(null)
            setReason('')
        },
    })

    const pendingClasses = (classes ?? []).filter((c: any) => c.status === 'SUBMITTED')

    return (
        <div className="relative">
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Class Approvals</h1>

            <AnimatePresence>
                {rejectionId && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <h3 className="text-lg font-bold text-surface-900 mb-2">Decline Class</h3>
                            <p className="text-sm text-surface-500 mb-4">Provide comments for the faculty regarding this class rejection.</p>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none mb-4 h-24"
                                placeholder="e.g. Invalid schedule, Duplicate class..."
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRejectionId(null)}
                                    className="flex-1 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 rounded-lg"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => rejectMutation.mutate({ id: rejectionId, reason })}
                                    disabled={!reason || rejectMutation.isPending}
                                    className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2"
                                >
                                    {rejectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Reject
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
            ) : (
                <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {pendingClasses.map((cls: any) => (
                            <motion.div
                                key={cls._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={
                                    actionId === cls._id && approveMutation.isSuccess
                                        ? { x: -100, opacity: 0 }
                                        : { x: 100, opacity: 0 }
                                }
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm flex items-center justify-between group hover:border-surface-300 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-surface-900">{cls.title}</p>
                                        <p className="text-sm font-medium text-surface-500">
                                            {cls.classCode} • Semester {cls.semester} • Section {cls.section}
                                        </p>
                                        <p className="text-xs text-surface-400 mt-1 font-medium">Faculty: {cls.facultyId?.name || 'Rahul Faculty'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => approveMutation.mutate(cls._id)}
                                        disabled={actionId === cls._id}
                                        className="h-10 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                                    >
                                        {actionId === cls._id && approveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setRejectionId(cls._id)}
                                        disabled={actionId === cls._id}
                                        className="h-10 px-4 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {!pendingClasses.length && (
                        <div className="text-center py-20">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-surface-100 rounded-full mb-4"
                            >
                                <BookOpen className="text-surface-400" size={32} />
                            </motion.div>
                            <p className="text-surface-500 font-medium">No classes pending approval.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
