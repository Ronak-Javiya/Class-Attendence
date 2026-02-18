/**
 * AdminOverrides — Modern attendance override interface
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '@/lib/animations'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Select } from '@/components/primitives/Select'
import { EmptyState } from '@/components/composite/EmptyState'
import { StatCard } from '@/components/composite/StatCard'
import api from '@/api/axios'
import {
  Shield,
  CheckCircle,
  XCircle,
  Search,
  AlertCircle,
  Calendar,
  History,
  Clock,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface AttendanceRecord {
  _id: string
  status: 'PRESENT' | 'ABSENT'
  createdAt: string
  studentId: {
    _id: string
    name: string
    email: string
    enrollmentNo?: string
  }
  lectureId: {
    _id: string
    date: string
    classId: {
      title: string
      classCode: string
    }
  }
  confidenceScore: number
}

interface OverrideHistory {
  _id: string
  originalStatus: string
  newStatus: string
  reason: string
  createdAt: string
  performedBy: {
    name: string
    role: string
  }
  attendanceEntryId: {
    studentId: {
      name: string
    }
    lectureId: {
      classId: {
        title: string
      }
    }
  }
}

export default function AdminOverrides() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [newStatus, setNewStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT')
  const [reason, setReason] = useState('')

  const { data: records, isLoading: isLoadingRecords } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance-records', searchQuery],
    queryFn: () => api.get(`/attendance/search?q=${searchQuery}`).then((r) => r.data.data),
    enabled: searchQuery.length > 2,
  })

  const { data: history, isLoading: isLoadingHistory } = useQuery<OverrideHistory[]>({
    queryKey: ['override-history'],
    queryFn: () => api.get('/overrides/history').then((r) => r.data.data),
  })

  const overrideMutation = useMutation({
    mutationFn: () =>
      api.post(`/attendance/${selectedRecord?._id}/override`, {
        newStatus,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] })
      queryClient.invalidateQueries({ queryKey: ['override-history'] })
      setSelectedRecord(null)
      setReason('')
      setNewStatus('PRESENT')
    },
  })

  const stats = {
    totalOverrides: history?.length || 0,
    presentOverrides: history?.filter((h) => h.newStatus === 'PRESENT').length || 0,
    absentOverrides: history?.filter((h) => h.newStatus === 'ABSENT').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attendance Overrides"
        description="Override attendance records with proper authorization"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Overrides"
          value={isLoadingHistory ? '-' : stats.totalOverrides}
          icon={<History className="w-5 h-5" />}
          iconBgColor="#F1F5F9"
          iconColor="#64748B"
        />
        <StatCard
          title="Changed to Present"
          value={isLoadingHistory ? '-' : stats.presentOverrides}
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
        />
        <StatCard
          title="Changed to Absent"
          value={isLoadingHistory ? '-' : stats.absentOverrides}
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="#FEF2F2"
          iconColor="#EF4444"
        />
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Attendance Record
          </CardTitle>
          <CardDescription>
            Search by student name, enrollment number, or class code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search attendance records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            helperText={searchQuery.length > 0 && searchQuery.length < 3 ? 'Type at least 3 characters' : ''}
          />

          {/* Search Results */}
          {isLoadingRecords ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-surface-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <motion.div
              variants={listVariants}
              initial="initial"
              animate="animate"
              className="mt-4 space-y-3"
            >
              {records.map((record) => (
                <motion.div
                  key={record._id}
                  variants={listItemVariants}
                  onClick={() => setSelectedRecord(record)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all',
                    selectedRecord?._id === record._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-surface-200 hover:border-primary-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                        {record.studentId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{record.studentId.name}</p>
                        <p className="text-sm text-surface-500">
                          {record.lectureId.classId.title} ({record.lectureId.classId.classCode})
                        </p>
                        <p className="text-xs text-surface-400 mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(record.lectureId.date)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={record.status === 'PRESENT' ? 'success' : 'error'}
                      size="sm"
                    >
                      {record.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : searchQuery.length >= 3 ? (
            <EmptyState
              icon="search"
              title="No records found"
              description="Try adjusting your search criteria"
              compact
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Override Form */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-warning-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning-700">
                  <Shield className="w-5 h-5" />
                  Override Attendance
                </CardTitle>
                <CardDescription>
                  You are about to modify an attendance record. This action will be logged.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Record Info */}
                <div className="p-4 bg-surface-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900">{selectedRecord.studentId.name}</p>
                      <p className="text-sm text-surface-500">
                        {selectedRecord.lectureId.classId.title} •{' '}
                        {formatDate(selectedRecord.lectureId.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-surface-500">Current Status</p>
                      <Badge
                        variant={selectedRecord.status === 'PRESENT' ? 'success' : 'error'}
                        size="sm"
                      >
                        {selectedRecord.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Override Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      New Status
                    </label>
                    <Select
                      options={[
                        { value: 'PRESENT', label: 'Present' },
                        { value: 'ABSENT', label: 'Absent' },
                      ]}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as 'PRESENT' | 'ABSENT')}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Reason for Override"
                      placeholder="Explain why this change is necessary..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      helperText="This will be recorded in the audit log"
                    />
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-warning-50 rounded-lg border border-warning-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-700">
                    <p className="font-medium">Important Notice</p>
                    <p className="mt-1">
                      This action will permanently modify the attendance record and cannot be undone.
                      All overrides are tracked in the audit log for compliance purposes.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedRecord(null)
                      setReason('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => overrideMutation.mutate()}
                    disabled={!reason || overrideMutation.isPending}
                    isLoading={overrideMutation.isPending}
                    leftIcon={<Shield className="w-4 h-4" />}
                  >
                    Apply Override
                  </Button>
                </div>

                {/* Success/Error Messages */}
                {overrideMutation.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-success-50 rounded-lg border border-success-200 flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <p className="text-sm text-success-700">
                      Override applied successfully. The attendance record has been updated.
                    </p>
                  </motion.div>
                )}
                {overrideMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-error-50 rounded-lg border border-error-200 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-error-600" />
                    <p className="text-sm text-error-700">
                      {(overrideMutation.error as any)?.response?.data?.message ||
                        'Failed to apply override. Please try again.'}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Override History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Overrides
          </CardTitle>
          <CardDescription>History of attendance record modifications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
              {history.slice(0, 10).map((item) => (
                <motion.div
                  key={item._id}
                  variants={listItemVariants}
                  className="p-4 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900">
                        {item.attendanceEntryId?.studentId?.name || 'Unknown Student'}
                      </p>
                      <p className="text-sm text-surface-500">
                        {item.attendanceEntryId?.lectureId?.classId?.title || 'Unknown Class'}
                      </p>
                      <p className="text-xs text-surface-400 mt-1">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.originalStatus === 'PRESENT' ? 'success' : 'error'}
                          size="sm"
                        >
                          {item.originalStatus}
                        </Badge>
                        <span className="text-surface-400">→</span>
                        <Badge
                          variant={item.newStatus === 'PRESENT' ? 'success' : 'error'}
                          size="sm"
                        >
                          {item.newStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-surface-400 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDate(item.createdAt)} by {item.performedBy?.name || 'Admin'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon="history"
              title="No override history"
              description="No attendance overrides have been performed yet."
              compact
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
