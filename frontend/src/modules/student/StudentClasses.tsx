/**
 * StudentClasses — View enrolled classes.
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import api from '../../api/axios'
import { BookOpen } from 'lucide-react'

export default function StudentClasses() {
    const { data, isLoading } = useQuery({
        queryKey: ['student-enrollments'],
        queryFn: () => api.get('/enrollments/my').then((r) => r.data.data),
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">My Classes</h1>

            {isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-lg" />)}</div>
            ) : (
                <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
                    {(data ?? []).map((enrollment: any) => (
                        <motion.div
                            key={enrollment._id}
                            variants={listItemVariants}
                            className="bg-white rounded-xl p-5 border border-surface-200 flex items-center gap-4"
                        >
                            <div className="w-11 h-11 rounded-lg bg-primary-100 flex items-center justify-center">
                                <BookOpen size={20} className="text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-surface-800">{enrollment.classId?.title || 'N/A'}</p>
                                <p className="text-sm text-surface-500">{enrollment.classId?.classCode || ''}</p>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${enrollment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                enrollment.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                {enrollment.status}
                            </span>
                        </motion.div>
                    ))}
                    {!data?.length && (
                        <p className="text-sm text-surface-400 text-center py-12">You are not enrolled in any classes yet.</p>
                    )}
                </motion.div>
            )}
        </div>
    )
}
