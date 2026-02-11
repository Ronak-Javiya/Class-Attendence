/**
 * Student Dashboard — Attendance summary and today's classes.
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import StatCard from '../../shared/ui/StatCard'
import api from '../../api/axios'
import { BookOpen, CheckCircle, XCircle, AlertTriangle, ArrowRight, Clock } from 'lucide-react'

export default function StudentDashboard() {
    const { data: attendance, isLoading } = useQuery({
        queryKey: ['student-attendance'],
        queryFn: () => api.get('/attendance/my').then((r) => r.data.data),
    })

    const { data: enrollments } = useQuery({
        queryKey: ['student-enrollments'],
        queryFn: () => api.get('/enrollments/my').then((r) => r.data.data),
    })

    const records = attendance ?? []
    const total = records.length
    const present = records.filter((r: any) => r.status === 'PRESENT').length
    const absent = total - present
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    const stats = [
        { label: 'Total Lectures', value: total, icon: <BookOpen size={22} />, color: 'bg-indigo-500/10 text-indigo-500' },
        { label: 'Present', value: present, icon: <CheckCircle size={22} />, color: 'bg-emerald-500/10 text-emerald-500' },
        { label: 'Absent', value: absent, icon: <XCircle size={22} />, color: 'bg-rose-500/10 text-rose-500' },
        { label: 'Attendance %', value: percentage, suffix: '%', icon: <AlertTriangle size={22} />, color: percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500' },
    ]

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Student Scholar</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Your Academic <span className="text-gradient">Portfolio</span>
                </h1>
                <p className="text-slate-500 font-medium">Tracking your attendance metrics and class enrollments in real-time.</p>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={listVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={isLoading ? 0 : stat.value}
                        suffix={stat.suffix}
                        icon={stat.icon}
                        colorClass={stat.color}
                    />
                ))}
            </motion.div>

            {/* Enrolled Classes */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Enrollments</h2>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Active Status</span>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Browse Courses <ArrowRight size={14} />
                    </button>
                </div>

                <motion.div variants={listVariants} initial="initial" animate="animate" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {(enrollments ?? []).map((e: any) => (
                        <motion.div
                            key={e._id}
                            variants={listItemVariants}
                            whileHover={{ y: -3 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 premium-shadow flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{e.classId?.title || 'Course'}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{e.classId?.classCode || 'REQ-000'}</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                            <Clock size={12} className="text-slate-400" />
                                            <span>Tier 1 Approval</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black tracking-[0.1em] px-3 py-1 rounded-full border
                                ${e.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                    e.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                }`}>{e.status}</span>
                        </motion.div>
                    ))}

                    {!enrollments?.length && (
                        <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-4 text-slate-400"
                            >
                                <BookOpen size={36} />
                            </motion.div>
                            <h3 className="text-lg font-bold text-slate-900">No active enrollments</h3>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">You haven't requested enrollment in any classes yet. Head to the course catalog to begin.</p>
                        </div>
                    )}
                </motion.div>
            </section>
        </div>
    )
}
