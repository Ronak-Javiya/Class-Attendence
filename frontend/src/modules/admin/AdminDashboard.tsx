/**
 * Admin Dashboard — Pending enrollments and escalated disputes.
 */
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants } from '../../shared/motion/variants'
import StatCard from '../../shared/ui/StatCard'
import api from '../../api/axios'
import { Users, ShieldCheck, FileText } from 'lucide-react'

export default function AdminDashboard() {
    const { data: pending } = useQuery({
        queryKey: ['admin-pending-enrollments'],
        queryFn: () => api.get('/enrollments/pending').then((r) => r.data.data),
    })

    const stats = [
        {
            label: 'Pending Enrollments',
            value: pending?.length ?? 0,
            icon: <Users size={22} />,
            color: 'bg-amber-500/10 text-amber-500'
        },
        {
            label: 'System Status',
            value: 'Operational',
            icon: <ShieldCheck size={22} />,
            color: 'bg-emerald-500/10 text-emerald-500'
        },
        {
            label: 'Reports',
            value: 'Generated',
            icon: <FileText size={22} />,
            color: 'bg-indigo-500/10 text-indigo-500'
        },
    ]

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Intelligence Briefing</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Admin <span className="text-gradient">Control Center</span>
                </h1>
                <p className="text-slate-500 font-medium">Monitoring classroom integrity and enrollment lifecycles.</p>
            </div>

            {/* Quick Stats Grid */}
            <section>
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
            </section>

            {/* Recent Activity / Action Needed Section (Placeholder for 10x feel) */}
            <section className="bg-white/50 border border-slate-200 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900">Priority Overrides</h3>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <ShieldCheck size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Clear for Takeoff</p>
                    <p className="text-xs text-slate-500 mt-1">No urgent system overrides or escalations detected.</p>
                </div>
            </section>
        </div>
    )
}
