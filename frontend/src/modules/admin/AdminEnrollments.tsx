/**
 * AdminEnrollments — Modern enrollment approval interface
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
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  Clock,
  Search,
  Calendar,
  GraduationCap,
  Mail,
  Check,
  X,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface Enrollment {
  _id: string
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED'
  createdAt: string
  studentId: {
    _id: string
    fullName: string
    email: string
    enrollmentNo?: string
  }
  classId: {
    _id: string
    title: string
    classCode: string
  }
}

export default function AdminEnrollments() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectionId, setRejectionId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const { data: enrollments, isLoading } = useQuery<Enrollment[]>({
    queryKey: ['admin-enrollments', statusFilter],
    queryFn: () => api.get(`/enrollments?status=${statusFilter}`).then((r) => r.data.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/enrollments/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      setActionId(null)
      setSelectedItems(new Set())
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/enrollments/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      setActionId(null)
      setRejectionId(null)
      setReason('')
      setSelectedItems(new Set())
    },
  })

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => api.post(`/enrollments/${id}/approve`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] })
      setSelectedItems(new Set())
    },
  })

  // Filter enrollments
  const filteredEnrollments = enrollments?.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.studentId.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.classId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.classId.classCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Calculate stats
  const stats = {
    pending: enrollments?.filter((e) => e.status === 'REQUESTED').length || 0,
    approved: enrollments?.filter((e) => e.status === 'APPROVED').length || 0,
    rejected: enrollments?.filter((e) => e.status === 'REJECTED').length || 0,
    total: enrollments?.length || 0,
  }

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredEnrollments?.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredEnrollments?.map((e) => e._id)))
    }
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All Enrollments' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Enrollment Management"
        description="Review and manage student enrollment requests"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <StatCard
          title="Total"
          value={isLoading ? '-' : stats.total}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
        />
      </div>

      {/* Filters & Bulk Actions */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by student name, email, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {statusFilter === 'pending' && selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-surface-200 flex items-center justify-between"
          >
            <span className="text-sm text-surface-600">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-3">
              <Button
                variant="success"
                size="sm"
                leftIcon={<Check className="w-4 h-4" />}
                onClick={() => bulkApproveMutation.mutate(Array.from(selectedItems))}
                isLoading={bulkApproveMutation.isPending}
              >
                Approve Selected
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Enrollment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                {statusFilter === 'pending' ? 'Pending Enrollments' : 'Enrollment Records'}
              </CardTitle>
              <CardDescription>
                {filteredEnrollments?.length || 0} enrollment{filteredEnrollments?.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            {statusFilter === 'pending' && filteredEnrollments && filteredEnrollments.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleSelectAll}>
                {selectedItems.size === filteredEnrollments.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
            <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredEnrollments.map((enrollment) => (
                  <motion.div
                    key={enrollment._id}
                    layout
                    variants={listItemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      selectedItems.has(enrollment._id)
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-surface-200 hover:border-surface-300'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox for pending items */}
                      {statusFilter === 'pending' && (
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(enrollment._id)}
                            onChange={() => handleSelect(enrollment._id)}
                            className="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                      )}

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
                        {enrollment.studentId.fullName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-surface-900">
                              {enrollment.studentId.fullName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {enrollment.studentId.email}
                              </span>
                              {enrollment.studentId.enrollmentNo && (
                                <>
                                  <span className="text-surface-300">•</span>
                                  <span>ID: {enrollment.studentId.enrollmentNo}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="primary" size="sm">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                {enrollment.classId.classCode}
                              </Badge>
                              <span className="text-sm text-surface-600">
                                {enrollment.classId.title}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-surface-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(enrollment.createdAt)}
                            </span>

                            {enrollment.status === 'REQUESTED' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => {
                                    setActionId(enrollment._id)
                                    approveMutation.mutate(enrollment._id)
                                  }}
                                  disabled={actionId === enrollment._id}
                                  isLoading={actionId === enrollment._id && approveMutation.isPending}
                                  leftIcon={<Check className="w-4 h-4" />}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setRejectionId(enrollment._id)}
                                  disabled={actionId === enrollment._id}
                                  leftIcon={<X className="w-4 h-4" />}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Badge
                                variant={
                                  enrollment.status === 'APPROVED'
                                    ? 'success'
                                    : enrollment.status === 'REJECTED'
                                    ? 'error'
                                    : 'default'
                                }
                                size="sm"
                              >
                                {enrollment.status}
                              </Badge>
                            )}
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
              icon="users"
              title={searchQuery ? 'No matching enrollments' : 'No enrollments found'}
              description={
                searchQuery
                  ? 'Try adjusting your search criteria.'
                  : statusFilter === 'pending'
                  ? 'No pending enrollment requests at the moment.'
                  : 'No enrollment records found for the selected filter.'
              }
            />
          )}
        </CardContent>
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
                  <h3 className="text-lg font-semibold text-surface-900">Reject Enrollment</h3>
                  <p className="text-sm text-surface-500">Please provide a reason for rejection</p>
                </div>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-error-500 focus:border-error-500 outline-none mb-4 h-24 resize-none"
                placeholder="e.g., Incomplete documentation, Invalid student ID..."
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
