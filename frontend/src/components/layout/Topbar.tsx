/**
 * Topbar Component
 * Header with breadcrumbs, search, and user actions
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import useAuthStore from '@/store/authStore';
import { getInitials } from '@/lib/utils';

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
    const { user, logout } = useAuthStore();
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                  {getInitials(user?.name || 'User')}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-surface-700">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white rounded-lg border border-surface-200 shadow-elevation-4 py-1 mt-1"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <p className="font-medium text-surface-900">{user?.name}</p>
                <p className="text-sm text-surface-500">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="h-px bg-surface-200 my-1" />
              <DropdownMenuItem className="px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 cursor-pointer flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 cursor-pointer flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 text-sm text-surface-700 hover:bg-surface-100 cursor-pointer flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator className="h-px bg-surface-200 my-1" />
              <DropdownMenuItem
                onClick={logout}
                className="px-3 py-2 text-sm text-error-600 hover:bg-error-50 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  }
);

Topbar.displayName = 'Topbar';

export { Topbar };
