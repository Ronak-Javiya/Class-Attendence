/**
 * FacultyDashboard — Modern dashboard for faculty members
 */

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  Users,
  Camera,
  CheckCircle,
  TrendingUp,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/composite/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/composite/EmptyState';
import api from '@/api/axios';
import useAuthStore from '@/store/authStore';
import { listVariants, listItemVariants, slideUpVariants, formStaggerVariants, formFieldVariants } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch faculty classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['faculty-classes'],
    queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
  });

  // Fetch today's lectures
  const { data: todaysLectures, isLoading: isLoadingLectures } = useQuery({
    queryKey: ['faculty-today-lectures'],
    queryFn: () => api.get('/lectures/today').then((r) => r.data.data),
  });

  // Fetch pending disputes
  const { data: disputes, isLoading: isLoadingDisputes } = useQuery({
    queryKey: ['faculty-pending-disputes'],
    queryFn: () => api.get('/disputes/pending').then((r) => r.data.data),
  });

  // Calculate stats
  const activeClasses = classes?.filter((c: any) => c.status === 'ACTIVE').length || 0;
  const pendingDisputes = disputes?.length || 0;
  const todayLectureCount = todaysLectures?.length || 0;

  // Get current day name
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        variants={formStaggerVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <motion.div variants={formFieldVariants}>
          <h1 className="text-2xl font-bold text-surface-900">
            Welcome, Professor {user?.name?.split(' ')[0] || 'Faculty'}
          </h1>
          <p className="text-surface-500 mt-1">
            Manage your classes and track student attendance
          </p>
        </motion.div>
        <motion.div variants={formFieldVariants} className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Calendar className="w-4 h-4" />}
          >
            {currentDay}, {currentDate}
          </Button>
          <Button
            leftIcon={<Camera className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.FACULTY.ATTENDANCE)}
          >
            Take Attendance
          </Button>
        </motion.div>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        variants={listVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Classes"
          value={isLoadingClasses ? '-' : classes?.length || 0}
          icon={<BookOpen className="w-6 h-6" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
          trend="neutral"
        />

        <StatCard
          title="Active Classes"
          value={isLoadingClasses ? '-' : activeClasses}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          trend={activeClasses > 0 ? 'up' : 'neutral'}
          trendValue={activeClasses > 0 ? 'Teaching' : undefined}
        />

        <StatCard
          title="Today's Lectures"
          value={isLoadingLectures ? '-' : todayLectureCount}
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
          trend={todayLectureCount > 0 ? 'neutral' : undefined}
          trendValue={todayLectureCount > 0 ? 'Scheduled' : 'No lectures'}
        />

        <StatCard
          title="Pending Disputes"
          value={isLoadingDisputes ? '-' : pendingDisputes}
          icon={<AlertCircle className="w-6 h-6" />}
          iconBgColor={pendingDisputes > 0 ? '#FEF2F2' : '#F1F5F9'}
          iconColor={pendingDisputes > 0 ? '#EF4444' : '#64748B'}
          trend={pendingDisputes > 0 ? 'down' : 'neutral'}
          trendValue={pendingDisputes > 0 ? 'Action needed' : 'All clear'}
        />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={formStaggerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* Today's Schedule - Takes 2 columns */}
        <motion.div variants={formFieldVariants} className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your lectures for {currentDay}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.FACULTY.CLASSES)}
              >
                View All Classes
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingLectures ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : todaysLectures?.length > 0 ? (
                <div className="space-y-3">
                  {todaysLectures.map((lecture: any, index: number) => (
                    <motion.div
                      key={lecture._id || index}
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      className="flex items-center justify-between p-4 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors bg-surface-50/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">
                            {lecture.classId?.title || 'Class'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-surface-500">
                              {lecture.startTime} - {lecture.endTime}
                            </span>
                            <Badge variant="primary" size="sm">
                              {lecture.classId?.classCode}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={lecture.status === 'LOCKED' ? 'secondary' : 'primary'}
                        disabled={lecture.status === 'LOCKED'}
                        onClick={() => navigate(`${ROUTES.FACULTY.ATTENDANCE}?lecture=${lecture._id}`)}
                      >
                        {lecture.status === 'LOCKED' ? 'Completed' : 'Take Attendance'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="calendar"
                  title="No lectures today"
                  description="You don't have any scheduled lectures for today."
                  actionLabel="View Schedule"
                  onAction={() => navigate(ROUTES.FACULTY.CLASSES)}
                  compact
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel - Takes 1 column */}
        <motion.div variants={formFieldVariants} className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<Camera className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.FACULTY.ATTENDANCE)}
              >
                Take Attendance
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<BookOpen className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.FACULTY.CLASSES)}
              >
                Manage Classes
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.FACULTY.DISPUTES)}
              >
                Review Disputes
                {pendingDisputes > 0 && (
                  <Badge variant="error" size="sm" className="ml-auto">
                    {pendingDisputes}
                  </Badge>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          {/* Disputes Alert */}
          {pendingDisputes > 0 && (
            <Card className="border-warning-200 bg-warning-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-warning-900">
                      Attention Required
                    </h3>
                    <p className="text-sm text-warning-700 mt-1">
                      You have {pendingDisputes} pending attendance dispute{pendingDisputes !== 1 ? 's' : ''} to review.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-warning-700 hover:text-warning-800 hover:bg-warning-100"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => navigate(ROUTES.FACULTY.DISPUTES)}
                    >
                      Review Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Assigned Classes Section */}
      <motion.section
        variants={slideUpVariants}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <PageHeader
          title="Assigned Classes"
          description="Classes you are currently teaching"
          actions={
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.FACULTY.CLASSES)}
            >
              Manage All
            </Button>
          }
        />

        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {classes?.map((cls: any) => (
            <motion.div
              key={cls._id}
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
                        {cls.title}
                      </h3>
                      <p className="text-sm text-surface-500">{cls.classCode}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                        <Users className="w-3 h-3" />
                        <span>Semester {cls.semester}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={cls.status === 'ACTIVE' ? 'success' : 'default'}
                    size="sm"
                  >
                    {cls.status}
                  </Badge>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-surface-400" />
                    <span className="text-sm text-surface-500">
                      Avg. Attendance: 85%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => navigate(`${ROUTES.FACULTY.CLASSES}?class=${cls._id}`)}
                  >
                    View
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          {!classes?.length && !isLoadingClasses && (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon="book"
                title="No classes assigned"
                description="You don't have any classes assigned to you yet. Contact the administration for class assignments."
              />
            </div>
          )}
        </motion.div>
      </motion.section>
    </div>
  );
}
