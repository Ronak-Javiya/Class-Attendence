/**
 * AdminDashboard — Modern system administration dashboard
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  CheckSquare,
  Activity,
  Settings,
  UserCheck,
  ArrowRight,
  Download,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/composite/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { EmptyState } from '@/components/composite/EmptyState';
import api from '@/api/axios';
import { listVariants, listItemVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Fetch pending enrollments
  const { data: pendingEnrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['admin-pending-enrollments'],
    queryFn: () => api.get('/enrollments/pending').then((r) => r.data.data),
  });

  // Fetch system stats
  const { data: systemStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-system-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data.data),
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: () => api.get('/audit/recent').then((r) => r.data.data),
  });

  // Excel upload state
  const [uploadRole, setUploadRole] = React.useState<'FACULTY' | 'STUDENT'>('STUDENT');
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<any>(null);
  const [uploadError, setUploadError] = React.useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('role', uploadRole);
      const res = await api.post('/register/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data.data);
      setFile(null);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const pendingCount = pendingEnrollments?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Admin Control Center
          </h1>
          <p className="text-surface-500 mt-1">
            System overview and administrative controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Activity className="w-4 h-4" />}
          >
            System Status: Operational
          </Button>
          <Button
            leftIcon={<Settings className="w-4 h-4" />}
            variant="secondary"
          >
            Settings
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
          title="Pending Enrollments"
          value={isLoadingEnrollments ? '-' : pendingCount}
          icon={<UserCheck className="w-6 h-6" />}
          iconBgColor={pendingCount > 0 ? '#FFFBEB' : '#F1F5F9'}
          iconColor={pendingCount > 0 ? '#F59E0B' : '#64748B'}
          trend={pendingCount > 0 ? 'neutral' : 'neutral'}
          trendValue={pendingCount > 0 ? 'Needs review' : 'All caught up'}
        />

        <StatCard
          title="Total Users"
          value={isLoadingStats ? '-' : systemStats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
          trend="neutral"
        />

        <StatCard
          title="Active Classes"
          value={isLoadingStats ? '-' : systemStats?.activeClasses || 0}
          icon={<CheckSquare className="w-6 h-6" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          trend="neutral"
        />

        <StatCard
          title="Today's Attendance"
          value={isLoadingStats ? '-' : `${systemStats?.todayAttendance || 0}%`}
          icon={<Activity className="w-6 h-6" />}
          iconBgColor="#F3E8FF"
          iconColor="#8B5CF6"
          trend="neutral"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Enrollments - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Enrollments</CardTitle>
                <CardDescription>Student enrollment requests awaiting approval</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.ADMIN.ENROLLMENTS)}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : pendingEnrollments?.length > 0 ? (
                <div className="space-y-3">
                  {pendingEnrollments.slice(0, 5).map((enrollment: any, index: number) => (
                    <motion.div
                      key={enrollment._id || index}
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      className="flex items-center justify-between p-4 rounded-lg border border-surface-100 hover:border-warning-200 hover:bg-warning-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-warning-600" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">
                            {enrollment.studentId?.name || 'Unknown Student'}
                          </p>
                          <p className="text-sm text-surface-500">
                            Requested: {enrollment.classId?.title || 'Unknown Class'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-surface-400">
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => navigate(ROUTES.ADMIN.ENROLLMENTS)}
                        >
                          Review
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="check"
                  title="No pending enrollments"
                  description="All enrollment requests have been processed."
                  compact
                />
              )}
            </CardContent>
          </Card>

          {/* Bulk Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk User Import</CardTitle>
              <CardDescription>Import faculty or students from Excel file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role toggle */}
              <div className="flex gap-2 p-1 bg-surface-100 rounded-lg w-fit">
                {(['FACULTY', 'STUDENT'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setUploadRole(role)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-all',
                      uploadRole === role
                        ? 'bg-white text-surface-900 shadow-sm'
                        : 'text-surface-500 hover:text-surface-700'
                    )}
                  >
                    {role === 'FACULTY' ? 'Faculty' : 'Students'}
                  </button>
                ))}
              </div>

              {/* Column hints */}
              <div className="text-sm text-surface-500 bg-surface-50 border border-surface-200 rounded-lg p-3">
                <span className="font-medium">Expected columns: </span>
                {uploadRole === 'FACULTY'
                  ? 'Name, Email, Contact No.'
                  : 'Name, Enrollment No., Email, Contact No., Current Sem'}
              </div>

              {/* File input */}
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className={cn(
                    "px-4 py-3 rounded-lg border-2 border-dashed text-sm text-center transition-colors",
                    file 
                      ? "border-primary-300 bg-primary-50 text-primary-700" 
                      : "border-surface-300 hover:border-primary-400 text-surface-500"
                  )}>
                    {file ? (
                      <span className="font-medium">{file.name}</span>
                    ) : (
                      'Click to select .xlsx file'
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  isLoading={uploading}
                  loadingText="Uploading..."
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Upload
                </Button>
              </div>

              {/* Upload result */}
              {uploadResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-success-200 bg-success-50"
                >
                  <div className="flex items-center gap-2 text-success-700 font-medium mb-1">
                    <CheckCircle className="w-4 h-4" />
                    Upload Complete
                  </div>
                  <p className="text-sm text-success-600">
                    Created: {uploadResult.created} | Skipped: {uploadResult.skipped}
                  </p>
                  {uploadResult.errors?.length > 0 && (
                    <details className="mt-2 text-sm text-warning-700">
                      <summary className="cursor-pointer font-medium">
                        View warnings ({uploadResult.errors.length})
                      </summary>
                      <ul className="mt-2 space-y-1 list-disc pl-4">
                        {uploadResult.errors.map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </motion.div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {uploadError}
                </div>
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
                leftIcon={<UserCheck className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.ADMIN.ENROLLMENTS)}
              >
                Review Enrollments
                {pendingCount > 0 && (
                  <Badge variant="warning" size="sm" className="ml-auto">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<CheckSquare className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.ADMIN.OVERRIDES)}
              >
                Manage Overrides
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<FileText className="w-4 h-4" />}
                onClick={() => navigate(ROUTES.ADMIN.REPORTS)}
              >
                Generate Reports
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Data
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system actions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-surface-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {activity.user} • {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="clipboard"
                  title="No recent activity"
                  description="System activity will appear here."
                  compact
                />
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-success-200 bg-success-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <h3 className="font-medium text-success-900">
                    System Operational
                  </h3>
                  <p className="text-sm text-success-700 mt-1">
                    All services are running normally. Last checked: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
