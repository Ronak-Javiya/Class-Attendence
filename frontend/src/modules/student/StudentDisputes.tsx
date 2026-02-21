/**
 * StudentDisputes — Modern attendance dispute management
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '@/lib/animations'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { EmptyState } from '@/components/composite/EmptyState'
import { StatCard } from '@/components/composite/StatCard'
import api from '@/api/axios'
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface Dispute {
  _id: string
  status: 'OPEN' | 'FACULTY_APPROVED' | 'FACULTY_REJECTED' | 'ADMIN_OVERRIDDEN'
  reason: string
  createdAt: string
  updatedAt: string
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

export default function StudentDisputes() {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'resolved'>('all')

  const { data: disputes, isLoading } = useQuery<Dispute[]>({
    queryKey: ['student-disputes'],
    queryFn: () => api.get('/disputes/my').then((r) => r.data.data),
  })

  // Calculate stats
  const stats = {
    total: disputes?.length || 0,
    open: disputes?.filter((d) => d.status === 'OPEN').length || 0,
    approved:
      disputes?.filter((d) => d.status === 'FACULTY_APPROVED' || d.status === 'ADMIN_OVERRIDDEN')
        .length || 0,
    rejected: disputes?.filter((d) => d.status === 'FACULTY_REJECTED').length || 0,
  }

  // Filter disputes
  const filteredDisputes = disputes?.filter((dispute) => {
    if (activeTab === 'open') return dispute.status === 'OPEN'
    if (activeTab === 'resolved')
      return ['FACULTY_APPROVED', 'FACULTY_REJECTED', 'ADMIN_OVERRIDDEN'].includes(dispute.status)
    return true
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { variant: 'warning' as const, icon: Clock, label: 'Under Review' }
      case 'FACULTY_APPROVED':
        return { variant: 'success' as const, icon: CheckCircle, label: 'Approved' }
      case 'ADMIN_OVERRIDDEN':
        return { variant: 'success' as const, icon: Shield, label: 'Admin Approved' }
      case 'FACULTY_REJECTED':
        return { variant: 'error' as const, icon: XCircle, label: 'Rejected' }
      default:
        return { variant: 'default' as const, icon: AlertCircle, label: status }
    }
  }

  const getStatusMessage = (dispute: Dispute) => {
    switch (dispute.status) {
      case 'OPEN':
        return 'Your dispute is being reviewed by faculty. You will be notified once a decision is made.'
      case 'FACULTY_APPROVED':
        return 'Your dispute has been approved by faculty. Your attendance has been updated.'
      case 'ADMIN_OVERRIDDEN':
        return 'An administrator has reviewed and approved your dispute.'
      case 'FACULTY_REJECTED':
        return dispute.facultyNote
          ? `Rejected: ${dispute.facultyNote}`
          : 'Your dispute was not approved. The original attendance record stands.'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Attendance Disputes"
        description="Track the status of your attendance disputes. To raise a new dispute, visit your Attendance page."
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Disputes"
          value={isLoading ? '-' : stats.total}
          icon={<MessageSquare className="w-5 h-5" />}
          iconBgColor="#F1F5F9"
          iconColor="#64748B"
        />
        <StatCard
          title="Under Review"
          value={isLoading ? '-' : stats.open}
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


      {/* Tabs */}
      <div className="border-b border-surface-200">
        <nav className="flex gap-6">
          {(['all', 'open', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab
                  ? 'text-primary-600'
                  : 'text-surface-500 hover:text-surface-700'
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Disputes List */}
      {isLoading ? (
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
                        dispute.status === 'ADMIN_OVERRIDDEN' && 'bg-success-100 text-success-600',
                        dispute.status === 'FACULTY_REJECTED' && 'bg-error-100 text-error-600'
                      )}
                    >
                      <StatusIcon className="w-6 h-6" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-surface-900">{dispute.reason}</h3>
                          {dispute.attendanceEntryId?.lectureId?.classId && (
                            <p className="text-sm text-surface-500 mt-1">
                              {dispute.attendanceEntryId.lectureId.classId.title} (
                              {dispute.attendanceEntryId.lectureId.classId.classCode})
                            </p>
                          )}
                          <p className="text-xs text-surface-400 mt-1">
                            Raised on {formatDate(dispute.createdAt)}
                          </p>
                        </div>
                        <Badge variant={statusConfig.variant} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Status Message */}
                      <div
                        className={cn(
                          'mt-4 p-3 rounded-lg text-sm',
                          dispute.status === 'OPEN' && 'bg-warning-50 text-warning-700',
                          dispute.status === 'FACULTY_APPROVED' && 'bg-success-50 text-success-700',
                          dispute.status === 'ADMIN_OVERRIDDEN' && 'bg-success-50 text-success-700',
                          dispute.status === 'FACULTY_REJECTED' && 'bg-error-50 text-error-700'
                        )}
                      >
                        {getStatusMessage(dispute)}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon="alert"
          title={activeTab === 'all' ? 'No disputes yet' : `No ${activeTab} disputes`}
          description={
            activeTab === 'all'
              ? "You haven't raised any attendance disputes. If you notice an incorrect attendance record, use the form above to raise a dispute."
              : `You don't have any ${activeTab} disputes at the moment.`
          }
        />
      )}
    </div>
  )
}
