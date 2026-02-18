/**
 * StudentClasses — View enrolled classes with modern design
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '@/lib/animations'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Select } from '@/components/primitives/Select'
import { EmptyState } from '@/components/composite/EmptyState'
import api from '@/api/axios'
import {
  BookOpen,
  Search,
  Clock,
  User,
  Calendar,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'

interface Enrollment {
  _id: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  createdAt: string
  classId: {
    _id: string
    title: string
    classCode: string
    description?: string
    facultyId?: {
      name: string
      email: string
    }
    semester?: number
    schedule?: {
      day: string
      startTime: string
      endTime: string
    }[]
  }
}

export default function StudentClasses() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: enrollments, isLoading } = useQuery<Enrollment[]>({
    queryKey: ['student-enrollments'],
    queryFn: () => api.get('/enrollments/my').then((r) => r.data.data),
  })

  // Filter enrollments
  const filteredEnrollments = enrollments?.filter((enrollment) => {
    const matchesSearch =
      enrollment.classId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.classId?.classCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.classId?.facultyId?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || enrollment.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'error'
      case 'PENDING':
      default:
        return 'warning'
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Classes"
        description="View and manage your class enrollments"
      />

      {/* Filters */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by class name, code, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
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
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">
          Showing {filteredEnrollments?.length || 0} of {enrollments?.length || 0} enrollments
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Enrollments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {filteredEnrollments.map((enrollment) => (
            <motion.div
              key={enrollment._id}
              variants={listItemVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="interactive" padding="lg">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Class Icon & Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-surface-900 text-lg">
                          {enrollment.classId?.title || 'Untitled Class'}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(enrollment.status)} size="sm">
                          {enrollment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-500 mt-1">
                        {enrollment.classId?.classCode || 'No Code'} • Semester{' '}
                        {enrollment.classId?.semester || 'N/A'}
                      </p>
                      {enrollment.classId?.description && (
                        <p className="text-sm text-surface-600 mt-2 line-clamp-2">
                          {enrollment.classId.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Faculty */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 lg:border-l lg:border-surface-200 lg:pl-8">
                    {/* Faculty */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-surface-500" />
                      </div>
                      <div>
                        <p className="text-xs text-surface-400 uppercase tracking-wide">Faculty</p>
                        <p className="text-sm font-medium text-surface-700">
                          {enrollment.classId?.facultyId?.name || 'Not Assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    {enrollment.classId?.schedule && enrollment.classId.schedule.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-surface-500" />
                        </div>
                        <div>
                          <p className="text-xs text-surface-400 uppercase tracking-wide">Schedule</p>
                          <p className="text-sm font-medium text-surface-700">
                            {enrollment.classId.schedule[0].day}
                          </p>
                          <p className="text-xs text-surface-500">
                            {enrollment.classId.schedule[0].startTime} -{' '}
                            {enrollment.classId.schedule[0].endTime}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-surface-500" />
                        </div>
                        <div>
                          <p className="text-xs text-surface-400 uppercase tracking-wide">Enrolled</p>
                          <p className="text-sm font-medium text-surface-700">
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center lg:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon="book"
          title={searchQuery ? 'No matching classes found' : 'No enrollments yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filter criteria.'
              : "You haven't enrolled in any classes yet. Browse available courses to get started."
          }
          actionLabel={!searchQuery ? 'Browse Courses' : undefined}
          onAction={!searchQuery ? () => { } : undefined}
        />
      )}

      {/* Info Card */}
      <Card variant="flat" padding="md" className="mt-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-info-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900">Need to enroll in more classes?</h4>
            <p className="text-sm text-surface-500 mt-1">
              Contact your faculty or visit the administration office to request enrollment in additional courses.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
