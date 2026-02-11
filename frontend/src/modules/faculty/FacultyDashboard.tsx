/**
 * Faculty Dashboard — Today's lectures and pending disputes.
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import StatCard from '../../shared/ui/StatCard'
import api from '../../api/axios'
import { Calendar, AlertTriangle, BookOpen, Clock, ArrowRight } from 'lucide-react'

export default function FacultyDashboard() {
    const { data: classes } = useQuery({
        queryKey: ['faculty-classes'],
        queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
    })

    const stats = [
        {
            label: 'Total Classes',
            value: classes?.length ?? 0,
            icon: <BookOpen size={22} />,
            color: 'bg-indigo-500/10 text-indigo-500'
        },
        {
            label: 'Today',
            value: new Date().toLocaleDateString('en-IN', { weekday: 'short' }),
            icon: <Calendar size={22} />,
            color: 'bg-emerald-500/10 text-emerald-500'
        },
        {
            label: 'Action Items',
            value: 'Pending',
            icon: <AlertTriangle size={22} />,
            color: 'bg-amber-500/10 text-amber-500'
        },
    ]

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Faculty Hub</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Welcome back, <span className="text-gradient">Professor</span>
                </h1>
                <p className="text-slate-500 font-medium">Your academic schedule and attendance tracking summary.</p>
            </div>

            {/* Summary Grid */}
            <motion.div
                variants={listVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        colorClass={stat.color}
                    />
                ))}
            </motion.div>

            {/* Classes Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Classes</h2>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Active Term</span>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Manage All <ArrowRight size={14} />
                    </button>
                </div>

                <motion.div variants={listVariants} initial="initial" animate="animate" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {(classes ?? []).map((cls: any) => (
                        <motion.div
                            key={cls._id}
                            variants={listItemVariants}
                            whileHover={{ y: -3 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 premium-shadow flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cls.title}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{cls.classCode}</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                            <Clock size={12} className="text-slate-400" />
                                            <span>Semester {cls.semester}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] font-black tracking-[0.1em] px-3 py-1 rounded-full border
                                    ${cls.status === 'ACTIVE'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                    }`}>
                                    {cls.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {!classes?.length && (
                        <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-4 text-slate-400"
                            >
                                <BookOpen size={36} />
                            </motion.div>
                            <h3 className="text-lg font-bold text-slate-900">No classes assigned</h3>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">Your teaching profile is current but no active courses have been linked to your account yet.</p>
                        </div>
                    )}
                </motion.div>
            </section>
        </div>
    )
}
