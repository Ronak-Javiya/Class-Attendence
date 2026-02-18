/**
 * StudentAttendance — Modern attendance tracking and history
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '@/lib/animations'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Select } from '@/components/primitives/Select'
import { EmptyState } from '@/components/composite/EmptyState'
import { StatCard } from '@/components/composite/StatCard'
import api from '@/api/axios'
import {
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  AlertCircle,
  TrendingUp,
  BookOpen,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AttendanceRecord {
  _id: string
  status: 'PRESENT' | 'ABSENT'
  confidenceScore: number
  createdAt: string
  attendanceRecordId?: {
    lectureId?: {
      date: string
      classId?: {
        _id?: string
        title: string
        classCode: string
      }
    }
  }
}

export default function StudentAttendance() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')

  const { data: attendance, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['student-attendance'],
    queryFn: () => api.get('/attendance/my').then((r) => r.data.data),
  })

  // Calculate statistics
  const stats = useMemo(() => {
    const records = attendance || []
    const total = records.length
    const present = records.filter((r) => r.status === 'PRESENT').length
    const absent = total - present
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { total, present, absent, percentage }
  }, [attendance])

  // Get unique classes for filter
  const classes = useMemo(() => {
    const uniqueClasses = new Map()
    attendance?.forEach((record) => {
      const classInfo = record.attendanceRecordId?.lectureId?.classId
      if (classInfo) {
        uniqueClasses.set(classInfo._id || classInfo.classCode, classInfo)
      }
    })
    return Array.from(uniqueClasses.values())
  }, [attendance])

  // Filter records
  const filteredRecords = attendance?.filter((record) => {
    const classInfo = record.attendanceRecordId?.lectureId?.classId
    const matchesSearch =
      !searchQuery ||
      classInfo?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classInfo?.classCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(record.createdAt).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || record.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesClass =
      classFilter === 'all' || classInfo?.classCode === classFilter

    return matchesSearch && matchesStatus && matchesClass
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
  ]

  const classOptions = [
    { value: 'all', label: 'All Classes' },
    ...classes.map((cls) => ({
      value: cls.classCode,
      label: `${cls.title} (${cls.classCode})`,
    })),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attendance Records"
        description="View your attendance history and AI verification confidence scores"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={isLoading ? '-' : stats.total}
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          title="Present"
          value={isLoading ? '-' : stats.present}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
          trend={stats.percentage >= 75 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Absent"
          value={isLoading ? '-' : stats.absent}
          icon={<XCircle className="w-6 h-6" />}
          iconBgColor="#FEF2F2"
          iconColor="#EF4444"
          trend={stats.absent > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Attendance Rate"
          value={isLoading ? '-' : `${stats.percentage}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor={stats.percentage >= 75 ? '#ECFDF5' : stats.percentage >= 60 ? '#FFFBEB' : '#FEF2F2'}
          iconColor={stats.percentage >= 75 ? '#10B981' : stats.percentage >= 60 ? '#F59E0B' : '#EF4444'}
          trend={stats.percentage >= 75 ? 'up' : stats.percentage >= 60 ? 'neutral' : 'down'}
          trendValue={stats.percentage >= 75 ? 'Good standing' : stats.percentage >= 60 ? 'Average' : 'At Risk'}
        />
      </div>

      {/* Filters */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by date, class name, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-40">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
            <div className="sm:w-56">
              <Select
                options={classOptions}
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                disabled={classes.length === 0}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Alert */}
      {stats.percentage < 75 && stats.total > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="font-medium text-warning-900">Low Attendance Warning</h3>
                <p className="text-sm text-warning-700 mt-1">
                  Your current attendance rate is {stats.percentage}%, which is below the required 75% minimum.
                  Please ensure regular attendance to avoid academic penalties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">
          Showing {filteredRecords?.length || 0} of {attendance?.length || 0} records
        </p>
        {(searchQuery || statusFilter !== 'all' || classFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setClassFilter('all')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Attendance List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredRecords && filteredRecords.length > 0 ? (
        <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
          {filteredRecords.map((record) => {
            const classInfo = record.attendanceRecordId?.lectureId?.classId
            const date = record.attendanceRecordId?.lectureId?.date || record.createdAt
            const confidenceScore = record.confidenceScore || 0

            return (
              <motion.div
                key={record._id}
                variants={listItemVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card variant="interactive" padding="md">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        record.status === 'PRESENT'
                          ? 'bg-success-100 text-success-600'
                          : 'bg-error-100 text-error-600'
                      }`}
                    >
                      {record.status === 'PRESENT' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-surface-900">
                          {formatDate(date)}
                        </h3>
                        <Badge variant={record.status === 'PRESENT' ? 'success' : 'error'} size="sm">
                          {record.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-surface-500 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          {classInfo?.title || 'Unknown Class'}
                          {classInfo?.classCode && (
                            <span className="text-surface-400">({classInfo.classCode})</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <span className="text-xs text-surface-400">AI Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              confidenceScore >= 80
                                ? 'bg-success-500'
                                : confidenceScore >= 60
                                ? 'bg-warning-500'
                                : 'bg-error-500'
                            }`}
                            style={{ width: `${confidenceScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-surface-700 w-10">
                          {confidenceScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon="calendar"
          title={searchQuery || statusFilter !== 'all' ? 'No matching records' : 'No attendance records'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : "Your attendance records will appear here once you start attending classes."
          }
        />
      )}

      {/* Info Card */}
      <Card variant="flat" padding="md" className="mt-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-info-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900">About AI Confidence Scores</h4>
            <p className="text-sm text-surface-500 mt-1">
              The confidence score represents how certain the AI system is about your attendance detection.
              Scores above 80% indicate high confidence, while lower scores may require manual review.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
