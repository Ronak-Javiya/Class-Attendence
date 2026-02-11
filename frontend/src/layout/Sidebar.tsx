/**
 * Sidebar — Persistent navigation.
 * Role-aware: Shows different links per user role.
 * Animated with Framer Motion and glassmorphism.
 */
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { sidebarVariants } from '../shared/motion/variants'
import useAuthStore, { type UserRole } from '../store/authStore'
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    AlertTriangle,
    Camera,
    ShieldCheck,
    Users,
    FileText,
    CheckSquare,
    ScrollText,
    GraduationCap,
    Sparkles
} from 'lucide-react'

interface NavItem {
    label: string
    path: string
    icon: React.ReactNode
}

const roleNavItems: Record<UserRole, NavItem[]> = {
    STUDENT: [
        { label: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
        { label: 'My Classes', path: '/student/classes', icon: <BookOpen size={20} /> },
        { label: 'Attendance', path: '/student/attendance', icon: <ClipboardList size={20} /> },
        { label: 'Face Enrollment', path: '/student/face-enroll', icon: <Camera size={20} /> },
        { label: 'Disputes', path: '/student/disputes', icon: <AlertTriangle size={20} /> },
    ],
    FACULTY: [
        { label: 'Dashboard', path: '/faculty', icon: <LayoutDashboard size={20} /> },
        { label: 'My Classes', path: '/faculty/classes', icon: <BookOpen size={20} /> },
        { label: 'Take Attendance', path: '/faculty/attendance', icon: <Camera size={20} /> },
        { label: 'Disputes', path: '/faculty/disputes', icon: <AlertTriangle size={20} /> },
    ],
    ADMIN: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Enrollments', path: '/admin/enrollments', icon: <Users size={20} /> },
        { label: 'Overrides', path: '/admin/overrides', icon: <ShieldCheck size={20} /> },
        { label: 'Reports', path: '/admin/reports', icon: <FileText size={20} /> },
    ],
    HOD: [
        { label: 'Dashboard', path: '/hod', icon: <LayoutDashboard size={20} /> },
        { label: 'Class Approvals', path: '/hod/approvals', icon: <CheckSquare size={20} /> },
        { label: 'Audit Logs', path: '/hod/audit', icon: <ScrollText size={20} /> },
        { label: 'Overrides', path: '/hod/overrides', icon: <ShieldCheck size={20} /> },
    ],
}

export default function Sidebar() {
    const user = useAuthStore((s) => s.user)
    const role = user?.role ?? 'STUDENT'
    const items = roleNavItems[role]

    return (
        <motion.aside
            variants={sidebarVariants}
            initial="initial"
            animate="animate"
            className="fixed left-0 top-0 bottom-0 w-[280px] glass-dark text-slate-300 flex flex-col z-40 border-r border-slate-800"
        >
            {/* Brand Section */}
            <div className="h-20 flex items-center gap-3 px-6 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <GraduationCap size={22} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-white text-base tracking-tight leading-none">Smart Attend</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-1.5 flex items-center gap-1">
                        <Sparkles size={10} className="text-indigo-400" />
                        NextGen Campus
                    </span>
                </div>
            </div>

            {/* Navigation Groups */}
            <div className="px-6 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">
                Main Navigator
            </div>

            <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {items.map((item) => {
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === `/${role.toLowerCase()}`}
                            className={({ isActive: linkActive }) =>
                                `group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${linkActive
                                    ? 'bg-indigo-600/10 text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`
                            }
                        >
                            {({ isActive: linkActive }) => (
                                <>
                                    <div className={`transition-colors duration-300 ${linkActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                        {item.icon}
                                    </div>
                                    <span className="relative z-10">{item.label}</span>

                                    {linkActive && (
                                        <motion.div
                                            layoutId="sidebarActiveBackground"
                                            className="absolute inset-0 bg-indigo-600/10 rounded-xl border-l-[3px] border-indigo-500"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    {!linkActive && (
                                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-1 h-1 rounded-full bg-slate-600" />
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            {/* System Status / User Profile Summary */}
            <div className="p-6 mt-auto">
                <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">{user?.name || 'User'}</span>
                            <span className="text-[10px] text-slate-500 font-medium">System Manager</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Online</span>
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">{role}</span>
                    </div>
                </div>
            </div>
        </motion.aside>
    )
}
