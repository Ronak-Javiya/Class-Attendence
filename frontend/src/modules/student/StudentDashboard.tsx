/**
 * StudentDashboard — Modern attendance summary and academic overview
 */

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  Camera,
  AlertCircle,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/composite/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/composite/EmptyState';
import api from '@/api/axios';
import useAuthStore from '@/store/authStore';
import { listVariants, listItemVariants } from '@/lib/animations';
import { formatDate, cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch attendance data
  const { data: attendance, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: () => api.get('/attendance/my').then((r) => r.data.data),
  });

  // Fetch enrollments
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['student-enrollments'],
    queryFn: () => api.get('/enrollments/my').then((r) => r.data.data),
  });

  // Calculate statistics
  const records = attendance ?? [];
  const total = records.length;
  const present = records.filter((r: any) => r.status === 'PRESENT').length;
  const absent = records.filter((r: any) => r.status === 'ABSENT').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  // Recent attendance (last 5 records)
  const recentAttendance = records.slice(0, 5);

  // Get enrollment status counts
  const enrollmentCounts = {
    approved: enrollments?.filter((e: any) => e.status === 'APPROVED').length || 0,
    pending: enrollments?.filter((e: any) => e.status === 'REQUESTED').length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-surface-500 mt-1">
            Here's an overview of your academic progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.STUDENT.ATTENDANCE)}
          >
            View Attendance
          </Button>
          <Button
            leftIcon={<Camera className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.STUDENT.FACE_ENROLL)}
          >
            Face Enrollment
          </Button>
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
          title="Total Lectures"
          value={isLoadingAttendance ? '-' : total}
          icon={<BookOpen className="w-6 h-6" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
          trend="neutral"
        />

        <StatCard
          title="Present"
          value={isLoadingAttendance ? '-' : present}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          trend={percentage >= 75 ? 'up' : 'neutral'}
          trendValue={percentage >= 75 ? 'Good standing' : undefined}
        />

        <StatCard
          title="Absent"
          value={isLoadingAttendance ? '-' : absent}
          icon={<XCircle className="w-6 h-6" />}
          iconBgColor="#FEF2F2"
          iconColor="#EF4444"
          trend={absent > 0 ? 'down' : 'neutral'}
        />

        <StatCard
          title="Attendance Rate"
          value={isLoadingAttendance ? '-' : `${percentage}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor={percentage >= 75 ? '#ECFDF5' : percentage >= 60 ? '#FFFBEB' : '#FEF2F2'}
          iconColor={percentage >= 75 ? '#10B981' : percentage >= 60 ? '#F59E0B' : '#EF4444'}
          trend={percentage >= 75 ? 'up' : percentage >= 60 ? 'neutral' : 'down'}
          trendValue={percentage >= 75 ? 'Excellent' : percentage >= 60 ? 'Average' : 'At Risk'}
          trendLabel="minimum 75% required"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Attendance - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Your attendance history for the past few days</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.STUDENT.ATTENDANCE)}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((record: any, index: number) => (
                    <motion.div
                      key={record._id || index}
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      className="flex items-center justify-between p-4 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            record.status === 'PRESENT'
                              ? 'bg-success-100 text-success-600'
                              : 'bg-error-100 text-error-600'
                          )}
                        >
                          {record.status === 'PRESENT' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">
                            {record.lectureId?.classId?.title || 'Class'}
                          </p>
                          <p className="text-sm text-surface-500">
                            {formatDate(record.lectureId?.date || record.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={record.status === 'PRESENT' ? 'success' : 'error'}
                        size="sm"
                      >
                        {record.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="calendar"
                  title="No attendance records"
                  description="Your attendance history will appear here once you start attending classes."
                  compact
                />
              )}
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
                leftIcon={<BookOpen className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.STUDENT.CLASSES)}
              >
                Browse Classes
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<Camera className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.STUDENT.FACE_ENROLL)}
              >
                Update Face Photos
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.STUDENT.DISPUTES)}
              >
                Raise a Dispute
              </Button>
            </CardContent>
          </Card>

          {/* Enrollment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Status</CardTitle>
              <CardDescription>Summary of your class enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <div className="space-y-3">
                  <div className="h-12 bg-surface-100 rounded-lg animate-pulse" />
                  <div className="h-12 bg-surface-100 rounded-lg animate-pulse" />
                </div>
              ) : enrollmentCounts.approved > 0 || enrollmentCounts.pending > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                      <span className="font-medium text-success-900">Approved</span>
                    </div>
                    <Badge variant="success">{enrollmentCounts.approved}</Badge>
                  </div>
                  {enrollmentCounts.pending > 0 && (
                    <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-warning-600" />
                        <span className="font-medium text-warning-900">Pending</span>
                      </div>
                      <Badge variant="warning">{enrollmentCounts.pending}</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon="clipboard"
                  title="No enrollments"
                  description="Request enrollment in classes to get started."
                  compact
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Enrollments Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <PageHeader
            title="My Enrollments"
            description="Classes you are currently enrolled in"
            actions={
              <Button
                variant="secondary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.STUDENT.CLASSES)}
              >
                Browse More
              </Button>
            }
          />
        </div>

        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {enrollments?.map((enrollment: any) => (
            <motion.div
              key={enrollment._id}
              variants={listItemVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="interactive" padding="md">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-surface-900 truncate">
                        {enrollment.classId?.title || 'Untitled Class'}
                      </h3>
                      <p className="text-sm text-surface-500">
                        {enrollment.classId?.classCode || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                        <Clock className="w-3 h-3" />
                        <span>Enrolled {formatDate(enrollment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      enrollment.status === 'APPROVED'
                        ? 'success'
                        : enrollment.status === 'REJECTED'
                        ? 'error'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}

          {!enrollments?.length && !isLoadingEnrollments && (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon="clipboard"
                title="No active enrollments"
                description="You haven't enrolled in any classes yet. Browse the course catalog to get started."
                actionLabel="Browse Classes"
                onAction={() => navigate(ROUTES.STUDENT.CLASSES)}
              />
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
