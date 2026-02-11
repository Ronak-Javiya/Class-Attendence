/**
 * LoginPage — Authentication screen with animated entrance.
 * Clean, professional design with premium glassmorphism.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const login = useAuthStore((s) => s.login)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)

            const token = localStorage.getItem('accessToken')
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                const roleRoutes: Record<string, string> = {
                    STUDENT: '/student',
                    FACULTY: '/faculty',
                    ADMIN: '/admin',
                    HOD: '/hod',
                }
                navigate(roleRoutes[payload.role] || '/login')
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/college_campus_aerial.png"
                    alt="Campus Background"
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-indigo-900/40" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md z-10"
            >
                {/* Glass Card */}
                <div className="glass-dark rounded-3xl p-10 premium-shadow">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20"
                        >
                            <GraduationCap size={32} className="text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Smart Attend</h1>
                        <p className="text-slate-400 text-sm font-medium">Enterprise College Portal</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl px-4 py-3 mb-6"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                Campus Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                placeholder="name@college.edu"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Portal</span>
                                    <ShieldCheck size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            <div className="w-8 h-[1px] bg-slate-800" />
                            Security Protocol Active
                            <div className="w-8 h-[1px] bg-slate-800" />
                        </div>
                        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                            Authorized access only. All sessions are monitored and logged. <br />
                            Contact Dept Admin for credential resets.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
