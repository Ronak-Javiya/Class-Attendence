/**
 * HodDashboard — Modern department head dashboard
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CheckSquare,
  ArrowUpRight,
  Users,
  Shield,
  UserCheck,
  UserX,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  Activity,
  FileText,
} from 'lucide-react';
import { StatCard } from '@/components/composite/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/composite/EmptyState';
import api from '@/api/axios';
import { listVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

export default function HodDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Fetch pending approvals (classes and admin registrations)
  const { data: pendingApprovals, isLoading: isLoadingApprovals } = useQuery({
    queryKey: ['hod-pending-approvals'],
    queryFn: () => api.get('/classes/pending-approval').then((r) => r.data.data),
  });

  // Fetch pending admin registrations
  const { data: pendingAdmins = [], isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['pending-admins'],
    queryFn: () => api.get('/register/pending-admins').then((r) => r.data.data),
  });

  // Fetch department stats
  const { data: deptStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['hod-department-stats'],
    queryFn: () => api.get('/hod/stats').then((r) => r.data.data),
  });

  // Approve/reject mutation
  const approvalMutation = useMutation({
    mutationFn: ({ id, approve, type }: { id: string; approve: boolean; type: 'class' | 'admin' }) =>
      type === 'class'
        ? api.patch(`/classes/${id}/approve`, { approve })
        : api.patch(`/register/approve/${id}`, { approve }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-admins'] });
      setActioningId(null);
    },
  });

  const totalPending = (pendingApprovals?.length || 0) + (pendingAdmins?.length || 0);
  const avgAttendance = deptStats?.avgAttendance || 82;

  // Sample data for attendance chart
  const attendanceData = [65, 78, 82, 70, 85, 90, 88];
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Department Overview
          </h1>
          <p className="text-surface-500 mt-1">
            Manage department classes and oversee academic operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="lg" className="px-3">
            <Shield className="w-4 h-4 mr-1.5" />
            Head of Department
          </Badge>
        </div>
      </div>

      {/* Statistics Grid */}
      <motion.div
        variants={listVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Department"
          value={deptStats?.department || 'CSE'}
          icon={<LayoutDashboard className="w-6 h-6" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
          trend="neutral"
        />

        <StatCard
          title="Avg. Attendance"
          value={isLoadingStats ? '-' : `${avgAttendance}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor={avgAttendance >= 80 ? '#ECFDF5' : '#FFFBEB'}
          iconColor={avgAttendance >= 80 ? '#10B981' : '#F59E0B'}
          trend={avgAttendance >= 80 ? 'up' : 'neutral'}
          trendValue={avgAttendance >= 80 ? 'Good standing' : 'Below target'}
          trendLabel="Target: 80%"
        />

        <StatCard
          title="Pending Approvals"
          value={isLoadingApprovals && isLoadingAdmins ? '-' : totalPending}
          icon={<CheckSquare className="w-6 h-6" />}
          iconBgColor={totalPending > 0 ? '#FFFBEB' : '#F1F5F9'}
          iconColor={totalPending > 0 ? '#F59E0B' : '#64748B'}
          trend={totalPending > 0 ? 'neutral' : 'neutral'}
          trendValue={totalPending > 0 ? 'Needs review' : 'All clear'}
        />

        <StatCard
          title="Total Faculty"
          value={isLoadingStats ? '-' : deptStats?.facultyCount || 0}
          icon={<GraduationCap className="w-6 h-6" />}
          iconBgColor="#F3E8FF"
          iconColor="#8B5CF6"
          trend="neutral"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Approvals - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Classes and registrations awaiting your approval</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.HOD.APPROVALS)}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingApprovals && isLoadingAdmins ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : totalPending > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {/* Class Approvals */}
                    {pendingApprovals?.map((item: any) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-surface-200 bg-white hover:border-warning-300 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-warning-600" />
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" size="sm">{item.classCode}</Badge>
                              <span className="text-xs text-surface-500">
                                Requested by {item.facultyId?.name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActioningId(item._id);
                              approvalMutation.mutate({ id: item._id, approve: false, type: 'class' });
                            }}
                            disabled={approvalMutation.isPending && actioningId === item._id}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setActioningId(item._id);
                              approvalMutation.mutate({ id: item._id, approve: true, type: 'class' });
                            }}
                            disabled={approvalMutation.isPending && actioningId === item._id}
                            isLoading={approvalMutation.isPending && actioningId === item._id}
                          >
                            Approve
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Admin Approvals */}
                    {pendingAdmins.map((admin: any) => (
                      <motion.div
                        key={admin._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-surface-200 bg-white hover:border-warning-300 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{admin.fullName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="primary" size="sm">Admin</Badge>
                              <span className="text-xs text-surface-500">{admin.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActioningId(admin._id);
                              approvalMutation.mutate({ id: admin._id, approve: false, type: 'admin' });
                            }}
                            disabled={approvalMutation.isPending && actioningId === admin._id}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setActioningId(admin._id);
                              approvalMutation.mutate({ id: admin._id, approve: true, type: 'admin' });
                            }}
                            disabled={approvalMutation.isPending && actioningId === admin._id}
                            isLoading={approvalMutation.isPending && actioningId === admin._id}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyState
                  icon="check"
                  title="No pending approvals"
                  description="All classes and registrations have been reviewed."
                  compact
                />
              )}
            </CardContent>
          </Card>

          {/* Attendance Trends Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Department Attendance Trends</CardTitle>
                <CardDescription>Weekly attendance variance across all classes</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +2.4%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4 px-2">
                {attendanceData.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative h-[180px] flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / 100) * 180}px` }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.33, 1, 0.68, 1] }}
                        className={cn(
                          'w-full rounded-t-lg relative transition-all',
                          value >= 80
                            ? 'bg-success-500 hover:bg-success-600'
                            : value >= 60
                            ? 'bg-warning-500 hover:bg-warning-600'
                            : 'bg-error-500 hover:bg-error-600'
                        )}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-xs font-medium py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {value}%
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-xs text-surface-500 font-medium">{weekLabels[index]}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-surface-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success-500" />
                    <span>≥ 80% (Good)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-warning-500" />
                    <span>60-79% (Average)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-error-500" />
                    <span>&lt; 60% (At Risk)</span>
                  </div>
                </div>
                <span className="text-xs text-surface-400">Updated hourly</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Takes 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<CheckSquare className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.HOD.APPROVALS)}
              >
                Review Approvals
                {totalPending > 0 && (
                  <Badge variant="warning" size="sm" className="ml-auto">
                    {totalPending}
                  </Badge>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<Shield className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.HOD.AUDIT)}
              >
                View Audit Logs
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<Activity className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.HOD.OVERRIDES)}
              >
                Manage Overrides
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Department Reports
              </Button>
            </CardContent>
          </Card>

          {/* Department Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Department Summary</CardTitle>
              <CardDescription>Current semester overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-surface-400" />
                  <span className="text-sm text-surface-700">Active Classes</span>
                </div>
                <span className="font-semibold text-surface-900">
                  {deptStats?.activeClasses || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-surface-400" />
                  <span className="text-sm text-surface-700">Total Students</span>
                </div>
                <span className="font-semibold text-surface-900">
                  {deptStats?.totalStudents || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-surface-400" />
                  <span className="text-sm text-surface-700">Faculty Members</span>
                </div>
                <span className="font-semibold text-surface-900">
                  {deptStats?.facultyCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Alert Card */}
          {avgAttendance < 80 && (
            <Card className="border-warning-200 bg-warning-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-warning-900">
                      Attendance Below Target
                    </h3>
                    <p className="text-sm text-warning-700 mt-1">
                      Department average is {avgAttendance}%, below the 80% target. Review attendance policies.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-warning-700 hover:text-warning-800 hover:bg-warning-100"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => navigate(ROUTES.HOD.AUDIT)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
