/**
 * Topbar — Header with user info and logout button.
 * Redesigned for premium feel.
 */
import useAuthStore from '../store/authStore'
import { LogOut, User, Bell, Search } from 'lucide-react'

export default function Topbar() {
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)

    const roleData: Record<string, { label: string; color: string }> = {
        STUDENT: { label: 'Student Scholar', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        FACULTY: { label: 'Faculty Professor', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        ADMIN: { label: 'System Admin', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        HOD: { label: 'Dept Head (HOD)', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
    }

    const { label, color } = roleData[user?.role ?? 'STUDENT']

    return (
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Search Bar / Welcome */}
            <div className="flex items-center gap-6 flex-1">
                <div className="relative group hidden md:block w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search student records, classes..."
                        className="w-full bg-slate-100/50 border border-transparent focus:border-indigo-500/30 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all focus:ring-4 focus:ring-indigo-500/5"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2" />

                {/* User Profile */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {user?.name || 'User'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
                            {label}
                        </span>
                    </div>

                    <div className="relative group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-2 ring-white overflow-hidden transition-transform group-hover:scale-105">
                            <User size={20} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-2" />

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs uppercase tracking-tighter"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Portal Exit</span>
                </button>
            </div>
        </header>
    )
}
