/**
 * ConfidenceIndicator — Circular or bar indicator with color interpolation.
 * Upgraded for premium visuals with fluid gradients.
 */
import { motion } from 'framer-motion'

interface ConfidenceIndicatorProps {
    score: number // 0 to 1
    size?: 'sm' | 'md'
}

export default function ConfidenceIndicator({ score, size = 'md' }: ConfidenceIndicatorProps) {
    const percentage = Math.round(score * 100)

    // Modern color mapping
    const getColorClass = (s: number) => {
        if (s < 0.4) return 'from-rose-500 to-rose-400'
        if (s < 0.7) return 'from-amber-500 to-amber-400'
        return 'from-emerald-500 to-emerald-400'
    }

    const colorClass = getColorClass(score)
    const isSm = size === 'sm'

    return (
        <div className="flex items-center gap-3">
            <div className={`${isSm ? 'w-24' : 'w-32'} h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                    className={`h-full rounded-full bg-gradient-to-r ${colorClass} shadow-sm`}
                />
            </div>
            <span className={`text-[10px] font-black font-mono tracking-tighter ${score < 0.4 ? 'text-rose-500' : score < 0.7 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                {percentage}% <span className="text-[8px] opacity-60 ml-0.5">MATCH</span>
            </span>
        </div>
    )
}
