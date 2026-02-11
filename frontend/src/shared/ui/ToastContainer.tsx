import { motion, AnimatePresence } from 'framer-motion'
import useToastStore, { ToastType } from '../../store/toastStore'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
}

const bgColors: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore()

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${bgColors[toast.type]}`}
                    >
                        {icons[toast.type]}
                        <span className="text-sm font-medium text-surface-800">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-auto p-1 hover:bg-surface-200/50 rounded-lg transition-colors"
                        >
                            <X size={16} className="text-surface-400" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
