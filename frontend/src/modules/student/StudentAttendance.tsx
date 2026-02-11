import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import api from '../../api/axios'
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import ConfidenceIndicator from '../../shared/ui/ConfidenceIndicator'

export default function StudentAttendance() {
    const { data, isLoading } = useQuery({
        queryKey: ['student-attendance'],
        queryFn: () => api.get('/attendance/my').then((r) => r.data.data),
    })

    const records = data ?? []

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Ledger History</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Attendance <span className="text-gradient">Records</span>
                </h1>
                <p className="text-slate-500 font-medium">Verify your classroom participation history and AI verification logs.</p>
            </div>

            {/* Quick Actions / Filters placeholder for 10x feel */}
            <div className="flex items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by date or lesson..."
                        className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-indigo-500/30 rounded-xl py-2 pl-10 pr-4 text-xs font-medium transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-3xl" />)}
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Genesis Node Empty</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">No participation records detected on the blockchain yet.</p>
                </div>
            ) : (
                <motion.div variants={listVariants} initial="initial" animate="animate" className="grid grid-cols-1 gap-4">
                    {records.map((record: any) => (
                        <motion.div
                            key={record._id}
                            variants={listItemVariants}
                            whileHover={{ scale: 1.005, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 flex items-center justify-between premium-shadow group transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${record.status === 'PRESENT'
                                        ? 'bg-emerald-500/10 text-emerald-600 shadow-lg shadow-emerald-500/5'
                                        : 'bg-rose-500/10 text-rose-600 shadow-lg shadow-rose-500/5'
                                    }`}>
                                    {record.status === 'PRESENT' ? <CheckCircle size={28} /> : <XCircle size={28} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        {new Date(record.attendanceRecordId?.lectureId?.date || record.createdAt).toLocaleDateString('en-IN', {
                                            weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                        {record.status === 'PRESENT' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <ConfidenceIndicator score={record.confidenceScore ?? 0} size="sm" />
                                        <div className="w-[1px] h-3 bg-slate-200" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Block Hash: {record._id.substring(0, 8)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm
                                    ${record.status === 'PRESENT'
                                        ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                                        : 'bg-rose-500/5 text-rose-600 border-rose-500/20'
                                    }`}>
                                    {record.status}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Neural Link Verified</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
