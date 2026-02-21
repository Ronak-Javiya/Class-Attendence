/**
 * Topbar Component
 * Header with breadcrumbs, search, and notifications
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  '': 'Dashboard',
  classes: 'Classes',
  attendance: 'Attendance',
  'face-enroll': 'Face Enrollment',
  disputes: 'Disputes',
  enrollments: 'Enrollments',
  overrides: 'Overrides',
  reports: 'Reports',
  approvals: 'Approvals',
  audit: 'Audit Logs',
};

interface TopbarProps {
  className?: string;
  onMenuClick?: () => void;
  notificationCount?: number;
}

const Topbar = React.forwardRef<HTMLDivElement, TopbarProps>(
  ({ className, onMenuClick, notificationCount = 0 }, ref) => {
    const location = useLocation();

    // Generate breadcrumbs from current path
    const breadcrumbs = React.useMemo(() => {
      const pathParts = location.pathname.split('/').filter(Boolean);
      const crumbs = [];
      let currentPath = '';

      for (const part of pathParts) {
        currentPath += `/${part}`;
        const label = breadcrumbMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
        crumbs.push({ label, path: currentPath });
      }

      return crumbs;
    }, [location.pathname]);

    return (
      <header
        ref={ref}
        className={cn(
          'h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30',
          className
        )}
      >
        {/* Left Section - Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <React.Fragment key={crumb.path}>
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-surface-400" />
                  )}
                  {isLast ? (
                    <span className="font-medium text-surface-900">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-surface-500 hover:text-surface-700 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
            )}
          </Button>
        </div>
      </header>
    );
  }
);

Topbar.displayName = 'Topbar';

export { Topbar };
