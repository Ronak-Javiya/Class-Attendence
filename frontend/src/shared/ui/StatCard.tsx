/**
 * StatCard — Consistent summary card with count-up animation.
 * Upgraded for premium visuals and higher impact.
 */
import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cardVariants } from '../motion/variants'

interface StatCardProps {
    label: string
    value: number | string
    icon: React.ReactNode
    colorClass: string
    suffix?: string
}

export default function StatCard({ label, value, icon, colorClass, suffix = '' }: StatCardProps) {
    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.]/g, ''))
    const springValue = useSpring(0, { stiffness: 45, damping: 15, mass: 1 })
    const displayValue = useTransform(springValue, (latest) =>
        typeof value === 'number' ? Math.floor(latest) : value
    )
    const [current, setCurrent] = useState<any>(typeof value === 'number' ? 0 : value)

    useEffect(() => {
        if (typeof value === 'number') {
            springValue.set(numericValue)
        }
    }, [numericValue, springValue, value])

    useEffect(() => {
        return displayValue.on('change', (latest) => {
            setCurrent(latest)
        })
    }, [displayValue])

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 premium-shadow group transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-current/10 transition-transform group-hover:scale-110 duration-300 ${colorClass}`}>
                    {icon}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 px-2 py-1 rounded-md">
                    Stats
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-0.5">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                        {typeof value === 'number' ? current : value}
                    </p>
                    {suffix && <span className="text-sm font-bold text-slate-400 mb-1">{suffix}</span>}
                </div>
            </div>

            {/* Subtle bottom indicator */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Insight</span>
            </div>
        </motion.div>
    )
}
