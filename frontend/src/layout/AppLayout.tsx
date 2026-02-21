/**
 * AppLayout — Main layout wrapper with sidebar and topbar.
 * Wraps role-specific content via <Outlet />.
 */

import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pageVariants, routeTransitionVariants } from '@/lib/animations';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function AppLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        {/* Topbar */}
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          notificationCount={0}
        />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                variants={routeTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
