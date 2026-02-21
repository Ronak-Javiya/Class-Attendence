/**
 * Sidebar Component
 * Navigation sidebar with role-based menu items
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Camera,
  AlertCircle,
  CheckSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  BookOpen,
  GraduationCap,
  Shield,
  UserCheck,
  Sun,
  Moon,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import useAuthStore from '@/store/authStore';
import { USER_ROLES, type UserRole, ROUTES } from '@/lib/constants';
import { useTheme } from '@/context/ThemeContext';

// Navigation item type
interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

// Role-based navigation
const navigationConfig: Record<UserRole, NavItem[]> = {
  [USER_ROLES.STUDENT]: [
    { label: 'Dashboard', path: ROUTES.STUDENT.DASHBOARD, icon: LayoutDashboard },
    { label: 'My Classes', path: ROUTES.STUDENT.CLASSES, icon: BookOpen },
    { label: 'Attendance', path: ROUTES.STUDENT.ATTENDANCE, icon: ClipboardList },
    { label: 'Face Enrollment', path: ROUTES.STUDENT.FACE_ENROLL, icon: Camera },
    { label: 'Disputes', path: ROUTES.STUDENT.DISPUTES, icon: AlertCircle },
  ],
  [USER_ROLES.FACULTY]: [
    { label: 'Dashboard', path: ROUTES.FACULTY.DASHBOARD, icon: LayoutDashboard },
    { label: 'My Classes', path: ROUTES.FACULTY.CLASSES, icon: Users },
    { label: 'Attendance', path: ROUTES.FACULTY.ATTENDANCE, icon: ClipboardList },
    { label: 'Disputes', path: ROUTES.FACULTY.DISPUTES, icon: AlertCircle },
  ],
  [USER_ROLES.ADMIN]: [
    { label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: 'Enrollments', path: ROUTES.ADMIN.ENROLLMENTS, icon: UserCheck },
    { label: 'Overrides', path: ROUTES.ADMIN.OVERRIDES, icon: CheckSquare },
    { label: 'Reports', path: ROUTES.ADMIN.REPORTS, icon: FileText },
  ],
  [USER_ROLES.HOD]: [
    { label: 'Dashboard', path: ROUTES.HOD.DASHBOARD, icon: LayoutDashboard },
    { label: 'Approvals', path: ROUTES.HOD.APPROVALS, icon: CheckSquare },
    { label: 'Audit Logs', path: ROUTES.HOD.AUDIT, icon: Shield },
    { label: 'Overrides', path: ROUTES.HOD.OVERRIDES, icon: Settings },
  ],
};

// Role labels and colors
const roleConfig: Record<UserRole, { label: string; color: string }> = {
  [USER_ROLES.STUDENT]: { label: 'Student', color: 'bg-purple-100 text-purple-700' },
  [USER_ROLES.FACULTY]: { label: 'Faculty', color: 'bg-sky-100 text-sky-700' },
  [USER_ROLES.ADMIN]: { label: 'Administrator', color: 'bg-amber-100 text-amber-700' },
  [USER_ROLES.HOD]: { label: 'Head of Department', color: 'bg-emerald-100 text-emerald-700' },
};

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      isCollapsed = false,
      onToggleCollapse,
      mobileOpen = false,
      onMobileClose,
    },
    ref
  ) => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const role = (user?.role as UserRole) || USER_ROLES.STUDENT;
    const navItems = navigationConfig[role] || [];
    const roleInfo = roleConfig[role];

    const SidebarContent = (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-white border-r border-surface-200',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          'transition-all duration-300 ease-in-out',
          className
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-surface-900 whitespace-nowrap"
              >
                Smart Attend
              </motion.span>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      'hover:bg-surface-100',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-surface-600',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-primary-600' : 'text-surface-400'
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <Badge variant="primary" size="sm" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Section — Profile + Theme + Logout */}
        <div className="p-3 border-t border-surface-100 space-y-2">
          {/* User Profile */}
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg bg-surface-50',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-5 h-5 text-primary-600" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">
                  {user?.name || 'User'}
                </p>
                <Badge
                  variant="default"
                  size="sm"
                  className={cn('mt-0.5', roleInfo.color)}
                >
                  {roleInfo.label}
                </Badge>
              </div>
            )}
          </div>

          {/* Theme Toggle & Logout */}
          <div className={cn('flex gap-2', isCollapsed ? 'flex-col items-center' : 'items-center')}>
            <Button
              variant="ghost"
              size={isCollapsed ? 'icon-sm' : 'sm'}
              onClick={toggleTheme}
              className={cn(!isCollapsed && 'flex-1')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              {!isCollapsed && (
                <span className="ml-2 text-xs">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size={isCollapsed ? 'icon-sm' : 'sm'}
              onClick={logout}
              className={cn(
                'text-error-600 hover:bg-error-50 hover:text-error-700',
                !isCollapsed && 'flex-1'
              )}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2 text-xs">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    );

    return (
      <>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-screen z-40">
          {SidebarContent}
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onMobileClose}
              />
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="fixed left-0 top-0 h-screen z-50 lg:hidden"
              >
                {SidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export { Sidebar, navigationConfig, roleConfig };
export type { NavItem };
