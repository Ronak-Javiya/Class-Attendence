/**
 * HOD Dashboard — Department-level attendance overview.
 * Upgraded for 10x premium analytical experience.
 */
import { motion } from 'framer-motion'
import { listVariants } from '../../shared/motion/variants'
import StatCard from '../../shared/ui/StatCard'
import { LayoutDashboard, TrendingUp, CheckSquare, ArrowUpRight, ChevronRight } from 'lucide-react'

export default function HodDashboard() {
    const stats = [
        {
            label: 'Departmental Scope',
            value: 'CSE',
            icon: <LayoutDashboard size={22} />,
            color: 'bg-indigo-500/10 text-indigo-500'
        },
        {
            label: 'Avg. Attendance',
            value: 82,
            icon: <TrendingUp size={22} />,
            color: 'bg-emerald-500/10 text-emerald-500',
            suffix: '%'
        },
        {
            label: 'Pending Approvals',
            value: 3,
            icon: <CheckSquare size={22} />,
            color: 'bg-amber-500/10 text-amber-500'
        },
    ]

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Department Head</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Analytics & <span className="text-gradient">Oversight</span>
                </h1>
                <p className="text-slate-500 font-medium">High-level insights into departmental attendance trends and academic integrity.</p>
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
                        suffix={stat.suffix}
                    />
                ))}
            </motion.div>

            {/* Attendance Trends Analytical View */}
            <section className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-8 premium-shadow">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Departmental Vitals</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Weekly attendance variance across all active blocks.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                            <ArrowUpRight size={14} />
                            +2.4% vs Last week
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-6 overflow-hidden px-4">
                    {[65, 78, 82, 70, 85, 90, 88].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full relative h-[200px] flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 1.2, delay: idx * 0.1, ease: [0.33, 1, 0.68, 1] }}
                                    className={`w-full bg-gradient-to-t from-indigo-500/80 to-indigo-400 rounded-t-2xl relative transition-all group-hover:scale-x-110 group-hover:from-indigo-600 group-hover:to-indigo-500 ${val > 80 ? 'shadow-lg shadow-indigo-200' : ''}`}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none mb-2 transform -translate-y-2 group-hover:translate-y-0">
                                        {val}%
                                    </div>
                                </motion.div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Week 0{idx + 1}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-tighter text-slate-400">
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>Present Trend</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <span>Target Margin</span>
                        </div>
                    </div>
                    <span className="text-indigo-500">Live Data Sync Active</span>
                </div>
            </section>
        </div>
    )
}
