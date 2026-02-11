/**
 * AppLayout — Main layout wrapper with sidebar and topbar.
 * Wraps role-specific content via <Outlet />.
 */
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { pageVariants } from '../shared/motion/variants'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
    const location = useLocation()

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            {/* Main content — offset by root variable width */}
            <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
                <Topbar />

                <main className="flex-1 p-8 overflow-x-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="w-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
