/**
 * HodAuditLogs — Modern audit log viewer
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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
  ScrollText,
  UserCheck,
  XCircle,
  Shield,
  Clock,
  Search,
  Calendar,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  User,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AuditLog {
  _id: string
  action: string
  entityType: 'ATTENDANCE' | 'ENROLLMENT' | 'DISPUTE' | 'CLASS' | 'OVERRIDE'
  entityId: string
  performedBy: {
    _id: string
    name: string
    role: string
  }
  timestamp: string
  details: {
    oldValue?: string
    newValue?: string
    reason?: string
  }
  ipAddress?: string
}

export default function HodAuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit/logs').then((r) => r.data.data),
  })

  // Filter logs
  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase())

    return matchesSearch && matchesEntity && matchesAction
  })

  // Calculate stats
  const stats = {
    total: logs?.length || 0,
    today: logs?.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length || 0,
    attendance: logs?.filter((l) => l.entityType === 'ATTENDANCE').length || 0,
    disputes: logs?.filter((l) => l.entityType === 'DISPUTE').length || 0,
  }

  const getActionIcon = (action: string) => {
    if (action.includes('APPROVE')) return CheckCircle
    if (action.includes('REJECT')) return XCircle
    if (action.includes('OVERRIDE')) return Shield
    if (action.includes('CREATE')) return FileText
    return ScrollText
  }

  const getEntityBadgeVariant = (entityType: string) => {
    switch (entityType) {
      case 'ATTENDANCE':
        return 'primary'
      case 'ENROLLMENT':
        return 'success'
      case 'DISPUTE':
        return 'warning'
      case 'CLASS':
        return 'secondary'
      case 'OVERRIDE':
        return 'error'
      default:
        return 'default'
    }
  }

  const entityOptions = [
    { value: 'all', label: 'All Entities' },
    { value: 'ATTENDANCE', label: 'Attendance' },
    { value: 'ENROLLMENT', label: 'Enrollment' },
    { value: 'DISPUTE', label: 'Dispute' },
    { value: 'CLASS', label: 'Class' },
    { value: 'OVERRIDE', label: 'Override' },
  ]

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'approve', label: 'Approved' },
    { value: 'reject', label: 'Rejected' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'override', label: 'Overridden' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and modifications"
        actions={
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Export Logs
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Logs"
          value={isLoading ? '-' : stats.total}
          icon={<ScrollText className="w-5 h-5" />}
          iconBgColor="#F1F5F9"
          iconColor="#64748B"
        />
        <StatCard
          title="Today"
          value={isLoading ? '-' : stats.today}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          title="Attendance Changes"
          value={isLoading ? '-' : stats.attendance}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="#F3E8FF"
          iconColor="#8B5CF6"
        />
        <StatCard
          title="Dispute Actions"
          value={isLoading ? '-' : stats.disputes}
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
        />
      </div>

      {/* Filters */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by action, user, or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <Select
                options={entityOptions}
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select
                options={actionOptions}
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Activity Log
            <Badge variant="default" size="sm" className="ml-2">
              {filteredLogs?.length || 0} entries
            </Badge>
          </CardTitle>
          <CardDescription>Chronological record of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-surface-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action)
                return (
                  <motion.div
                    key={log._id}
                    variants={listItemVariants}
                    className="p-4 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0">
                        <ActionIcon className="w-5 h-5 text-surface-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-surface-900">{log.action}</h4>
                              <Badge variant={getEntityBadgeVariant(log.entityType)} size="sm">
                                {log.entityType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {log.performedBy.name}
                                <span className="text-surface-400">({log.performedBy.role})</span>
                              </span>
                              <span className="text-surface-300">•</span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                            {log.details.reason && (
                              <p className="text-sm text-surface-600 mt-2 bg-surface-50 p-2 rounded">
                                Reason: {log.details.reason}
                              </p>
                            )}
                            {(log.details.oldValue || log.details.newValue) && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                {log.details.oldValue && (
                                  <span className="text-surface-500">
                                    From: <span className="line-through">{log.details.oldValue}</span>
                                  </span>
                                )}
                                {log.details.newValue && (
                                  <span className="text-success-600">
                                    To: {log.details.newValue}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <EmptyState
              icon="search"
              title="No logs found"
              description={
                searchQuery || entityFilter !== 'all' || actionFilter !== 'all'
                  ? 'Try adjusting your filter criteria.'
                  : 'No audit logs available at the moment.'
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card variant="flat" padding="md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-info-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900">Immutable Audit Trail</h4>
            <p className="text-sm text-surface-500 mt-1">
              All system activities are permanently logged for compliance and security purposes. 
              Audit logs cannot be modified or deleted once recorded. Logs are retained for 
              7 years as per institutional policy.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
