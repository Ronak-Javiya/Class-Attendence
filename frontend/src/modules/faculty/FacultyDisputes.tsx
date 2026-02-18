/**
 * FacultyDisputes — Modern dispute review and resolution interface
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '@/lib/animations'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Select } from '@/components/primitives/Select'
import { Input } from '@/components/primitives/Input'
import { EmptyState } from '@/components/composite/EmptyState'
import { StatCard } from '@/components/composite/StatCard'
import api from '@/api/axios'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  Shield,
  ChevronRight,
  Search,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface Dispute {
  _id: string
  status: 'OPEN' | 'FACULTY_APPROVED' | 'FACULTY_REJECTED' | 'ADMIN_OVERRIDDEN'
  reason: string
  createdAt: string
  updatedAt: string
  studentId?: {
    _id: string
    name: string
    email: string
    enrollmentNo?: string
  }
  attendanceEntryId?: {
    lectureId?: {
      classId?: {
        title: string
        classCode: string
      }
      date: string
    }
    status: string
  }
  facultyNote?: string
}

interface Class {
  _id: string
  title: string
  classCode: string
}

export default function FacultyDisputes() {
  const queryClient = useQueryClient()
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)

  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['faculty-classes'],
    queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
  })

  const { data: disputes, isLoading: isLoadingDisputes } = useQuery<Dispute[]>({
    queryKey: ['faculty-disputes', selectedClass],
    queryFn: () =>
      selectedClass === 'all'
        ? api.get('/disputes/faculty').then((r) => r.data.data)
        : api.get(`/disputes/class/${selectedClass}`).then((r) => r.data.data),
    enabled: !!classes,
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution, note }: { id: string; resolution: string; note?: string }) =>
      api.post(`/disputes/${id}/resolve`, { resolution, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-disputes'] })
      setSelectedDispute(null)
      setRejectionReason('')
      setActioningId(null)
    },
  })

  // Calculate stats
  const stats = {
    total: disputes?.length || 0,
    open: disputes?.filter((d) => d.status === 'OPEN').length || 0,
    approved: disputes?.filter((d) => d.status === 'FACULTY_APPROVED').length || 0,
    rejected: disputes?.filter((d) => d.status === 'FACULTY_REJECTED').length || 0,
  }

  // Filter disputes
  const filteredDisputes = disputes?.filter((dispute) => {
    const matchesSearch =
      !searchQuery ||
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.studentId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.studentId?.enrollmentNo?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || dispute.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleResolve = (id: string, resolution: 'APPROVE' | 'REJECT') => {
    setActioningId(id)
    resolveMutation.mutate({
      id,
      resolution,
      note: resolution === 'REJECT' ? rejectionReason : undefined,
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { variant: 'warning' as const, label: 'Pending Review', icon: Clock }
      case 'FACULTY_APPROVED':
        return { variant: 'success' as const, label: 'Approved', icon: CheckCircle }
      case 'FACULTY_REJECTED':
        return { variant: 'error' as const, label: 'Rejected', icon: XCircle }
      case 'ADMIN_OVERRIDDEN':
        return { variant: 'primary' as const, label: 'Admin Override', icon: Shield }
      default:
        return { variant: 'default' as const, label: status, icon: AlertCircle }
    }
  }

  const classOptions = [
    { value: 'all', label: 'All Classes' },
    ...(classes?.map((c) => ({ value: c._id, label: `${c.title} (${c.classCode})` })) || []),
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Pending Review' },
    { value: 'faculty_approved', label: 'Approved' },
    { value: 'faculty_rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dispute Review"
        description="Review and resolve student attendance disputes"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Disputes"
          value={isLoadingDisputes ? '-' : stats.total}
          icon={<MessageSquare className="w-5 h-5" />}
          iconBgColor="#F1F5F9"
          iconColor="#64748B"
        />
        <StatCard
          title="Pending Review"
          value={isLoadingDisputes ? '-' : stats.open}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
        />
        <StatCard
          title="Approved"
          value={isLoadingDisputes ? '-' : stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
        />
        <StatCard
          title="Rejected"
          value={isLoadingDisputes ? '-' : stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="#FEF2F2"
          iconColor="#EF4444"
        />
      </div>

      {/* Filters */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by student name or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-56">
              <Select
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={isLoadingClasses}
              />
            </div>
            <div className="sm:w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Alert for pending disputes */}
      {stats.open > 0 && (
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-warning-900">
                  {stats.open} Dispute{stats.open !== 1 ? 's' : ''} Pending Review
                </h3>
                <p className="text-sm text-warning-700 mt-1">
                  Please review and resolve the pending disputes below. Students are waiting for your decision.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disputes List */}
      {isLoadingDisputes ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredDisputes && filteredDisputes.length > 0 ? (
        <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-4">
          {filteredDisputes.map((dispute) => {
            const statusConfig = getStatusConfig(dispute.status)
            const StatusIcon = statusConfig.icon

            return (
              <motion.div key={dispute._id} variants={listItemVariants}>
                <Card variant="interactive" padding="md">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        dispute.status === 'OPEN' && 'bg-warning-100 text-warning-600',
                        dispute.status === 'FACULTY_APPROVED' && 'bg-success-100 text-success-600',
                        dispute.status === 'FACULTY_REJECTED' && 'bg-error-100 text-error-600',
                        dispute.status === 'ADMIN_OVERRIDDEN' && 'bg-primary-100 text-primary-600'
                      )}
                    >
                      <StatusIcon className="w-6 h-6" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-surface-900">{dispute.reason}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-surface-500 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              {dispute.studentId?.name || 'Unknown Student'}
                              {dispute.studentId?.enrollmentNo && (
                                <span className="text-surface-400">
                                  ({dispute.studentId.enrollmentNo})
                                </span>
                              )}
                            </span>
                            <span className="text-surface-300">•</span>
                            <span className="text-sm text-surface-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(dispute.createdAt)}
                            </span>
                          </div>
                          {dispute.attendanceEntryId?.lectureId?.classId && (
                            <p className="text-sm text-surface-500 mt-2">
                              Class: {dispute.attendanceEntryId.lectureId.classId.title} (
                              {dispute.attendanceEntryId.lectureId.classId.classCode})
                            </p>
                          )}
                        </div>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Current Status Display */}
                      {dispute.status !== 'OPEN' && (
                        <div
                          className={cn(
                            'mt-4 p-3 rounded-lg text-sm',
                            dispute.status === 'FACULTY_APPROVED' && 'bg-success-50 text-success-700',
                            dispute.status === 'FACULTY_REJECTED' && 'bg-error-50 text-error-700',
                            dispute.status === 'ADMIN_OVERRIDDEN' && 'bg-primary-50 text-primary-700'
                          )}
                        >
                          {dispute.status === 'FACULTY_APPROVED'
                            ? 'You approved this dispute. The attendance has been updated to PRESENT.'
                            : dispute.status === 'FACULTY_REJECTED'
                            ? `You rejected this dispute. ${dispute.facultyNote || ''}`
                            : 'An administrator has overridden this dispute.'}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {dispute.status === 'OPEN' && (
                        <div className="mt-4 space-y-4">
                          {selectedDispute?._id === dispute._id ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-3"
                            >
                              <Input
                                label="Reason for Rejection (optional)"
                                placeholder="Explain why the dispute is being rejected..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedDispute(null)
                                    setRejectionReason('')
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="success"
                                  onClick={() => handleResolve(dispute._id, 'APPROVE')}
                                  disabled={resolveMutation.isPending && actioningId === dispute._id}
                                  isLoading={resolveMutation.isPending && actioningId === dispute._id}
                                  leftIcon={<CheckCircle className="w-4 h-4" />}
                                >
                                  Approve Dispute
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => handleResolve(dispute._id, 'REJECT')}
                                  disabled={resolveMutation.isPending && actioningId === dispute._id}
                                  isLoading={resolveMutation.isPending && actioningId === dispute._id}
                                  leftIcon={<XCircle className="w-4 h-4" />}
                                >
                                  Reject Dispute
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleResolve(dispute._id, 'APPROVE')}
                                disabled={resolveMutation.isPending}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setSelectedDispute(dispute)}
                                disabled={resolveMutation.isPending}
                                leftIcon={<XCircle className="w-4 h-4" />}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                rightIcon={<ChevronRight className="w-4 h-4" />}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon="check"
          title={searchQuery || statusFilter !== 'all' ? 'No matching disputes' : 'No disputes'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : "Great! You don't have any disputes to review at the moment."
          }
        />
      )}

      {/* Guidelines Card */}
      <Card variant="flat" padding="md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-info-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900">Dispute Resolution Guidelines</h4>
            <ul className="mt-2 space-y-1 text-sm text-surface-600">
              <li>• <strong>Approve</strong> when the student was present but marked absent due to detection issues</li>
              <li>• <strong>Reject</strong> when the student was genuinely absent or the reason is invalid</li>
              <li>• Always provide a clear reason when rejecting a dispute</li>
              <li>• Disputes should be resolved within 48 hours of being raised</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
