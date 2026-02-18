/**
 * HodApprovals — Modern class approval interface for HOD
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
import { EmptyState } from '@/components/composite/EmptyState'
import { StatCard } from '@/components/composite/StatCard'
import api from '@/api/axios'
import {
  CheckCircle,
  XCircle,
  BookOpen,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  Search,
  GraduationCap,
  Check,
  X,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Class {
  _id: string
  title: string
  classCode: string
  description?: string
  semester: number
  section: string
  status: 'SUBMITTED' | 'ACTIVE' | 'REJECTED'
  createdAt: string
  facultyId?: {
    _id: string
    name: string
    email: string
  }
  schedule?: {
    day: string
    startTime: string
    endTime: string
  }[]
}

export default function HodApprovals() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectionId, setRejectionId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const { data: classes, isLoading } = useQuery<Class[]>({
    queryKey: ['hod-classes'],
    queryFn: () => api.get('/classes?role=HOD').then((r) => r.data.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/classes/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-classes'] })
      setActionId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/classes/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hod-classes'] })
      setActionId(null)
      setRejectionId(null)
      setReason('')
    },
  })

  // Filter classes
  const pendingClasses = classes?.filter((c) => c.status === 'SUBMITTED') || []
  const filteredClasses = pendingClasses.filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.facultyId?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate stats
  const stats = {
    pending: pendingClasses.length,
    approved: classes?.filter((c) => c.status === 'ACTIVE').length || 0,
    rejected: classes?.filter((c) => c.status === 'REJECTED').length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Class Approvals"
        description="Review and approve class submissions from faculty"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Pending"
          value={isLoading ? '-' : stats.pending}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
        />
        <StatCard
          title="Approved"
          value={isLoading ? '-' : stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
        />
        <StatCard
          title="Rejected"
          value={isLoading ? '-' : stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="#FEF2F2"
          iconColor="#EF4444"
        />
      </div>

      {/* Alert for pending approvals */}
      {stats.pending > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="font-medium text-warning-900">
                  {stats.pending} Class{stats.pending !== 1 ? 'es' : ''} Pending Approval
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  Please review the pending class submissions below and approve or reject them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {stats.pending > 0 && (
        <Card variant="flat" padding="md">
          <Input
            placeholder="Search by class name, code, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </Card>
      )}

      {/* Pending Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Pending Class Submissions
            <Badge variant="warning" size="sm" className="ml-2">
              {filteredClasses.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Classes submitted by faculty awaiting your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-surface-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredClasses.length > 0 ? (
            <motion.div
              variants={listVariants}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredClasses.map((cls) => (
                  <motion.div
                    key={cls._id}
                    layout
                    variants={listItemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="p-5 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-surface-900 text-lg">{cls.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" size="sm">
                                {cls.classCode}
                              </Badge>
                              <span className="text-sm text-surface-500">
                                Semester {cls.semester} • Section {cls.section}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-surface-600">
                              <User className="w-4 h-4" />
                              <span>Faculty: {cls.facultyId?.name || 'Unknown'}</span>
                            </div>
                            {cls.description && (
                              <p className="text-sm text-surface-600 mt-3 line-clamp-2">
                                {cls.description}
                              </p>
                            )}
                            {cls.schedule && cls.schedule.length > 0 && (
                              <div className="flex items-center gap-2 mt-3 text-sm text-surface-500">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {cls.schedule[0].day}, {cls.schedule[0].startTime} -{' '}
                                  {cls.schedule[0].endTime}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-surface-400">
                              Submitted {formatDate(cls.createdAt)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => {
                                  setActionId(cls._id)
                                  approveMutation.mutate(cls._id)
                                }}
                                disabled={actionId === cls._id}
                                isLoading={actionId === cls._id && approveMutation.isPending}
                                leftIcon={<Check className="w-4 h-4" />}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setRejectionId(cls._id)}
                                disabled={actionId === cls._id}
                                leftIcon={<X className="w-4 h-4" />}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState
              icon="check"
              title={searchQuery ? 'No matching classes' : 'No pending approvals'}
              description={
                searchQuery
                  ? 'Try adjusting your search criteria.'
                  : "Great! There are no class submissions pending your approval at the moment."
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card variant="flat" padding="md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-info-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900">Approval Guidelines</h4>
            <ul className="mt-2 space-y-1 text-sm text-surface-600">
              <li>• Verify class details are accurate and complete</li>
              <li>• Ensure schedule doesn't conflict with existing classes</li>
              <li>• Check faculty workload and availability</li>
              <li>• Provide constructive feedback when rejecting</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Reject Class</h3>
                  <p className="text-sm text-surface-500">Provide feedback to the faculty</p>
                </div>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-error-500 focus:border-error-500 outline-none mb-4 h-24 resize-none"
                placeholder="e.g., Schedule conflicts with another class, Invalid course code..."
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setRejectionId(null)
                    setReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  disabled={!reason || rejectMutation.isPending}
                  isLoading={rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate({ id: rejectionId, reason })
                  }
                >
                  Confirm Rejection
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
