/**
 * FacultyClasses — Modern class management for faculty
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
  Users,
  BookOpen,
  Search,
  GraduationCap,
  Mail,
  ChevronRight,
  Clock,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Class {
  _id: string
  title: string
  classCode: string
  description?: string
  semester: number
  status: 'ACTIVE' | 'DRAFT' | 'PENDING'
  schedule?: {
    day: string
    startTime: string
    endTime: string
  }[]
  studentCount?: number
}

interface Student {
  _id: string
  studentId: {
    _id: string
    name: string
    email: string
    enrollmentNo?: string
  }
  status: 'APPROVED' | 'PENDING'
  createdAt: string
}

export default function FacultyClasses() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['faculty-classes'],
    queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
  })

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ['class-students', selectedClass],
    queryFn: () => api.get(`/classes/${selectedClass}/students`).then((r) => r.data.data),
    enabled: !!selectedClass,
  })

  // Get selected class details
  const selectedClassDetails = classes?.find((c) => c._id === selectedClass)

  // Filter classes
  const filteredClasses = classes?.filter((cls) => {
    const matchesSearch =
      !searchQuery ||
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || cls.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    totalClasses: classes?.length || 0,
    activeClasses: classes?.filter((c) => c.status === 'ACTIVE').length || 0,
    totalStudents: students?.length || 0,
    pendingEnrollments: students?.filter((s) => s.status === 'PENDING').length || 0,
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Classes"
        description="Manage your classes and view enrolled students"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Classes"
          value={isLoadingClasses ? '-' : stats.totalClasses}
          icon={<BookOpen className="w-5 h-5" />}
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
        />
        <StatCard
          title="Active Classes"
          value={isLoadingClasses ? '-' : stats.activeClasses}
          icon={<GraduationCap className="w-5 h-5" />}
          iconBgColor="#ECFDF5"
          iconColor="#10B981"
        />
        <StatCard
          title="Total Students"
          value={selectedClass ? (isLoadingStudents ? '-' : stats.totalStudents) : '-'}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="#F3E8FF"
          iconColor="#8B5CF6"
        />
        <StatCard
          title="Pending Enrollments"
          value={selectedClass ? (isLoadingStudents ? '-' : stats.pendingEnrollments) : '-'}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="#FFFBEB"
          iconColor="#F59E0B"
        />
      </div>

      {/* Filters */}
      <Card variant="flat" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search classes..."
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Classes
                <Badge variant="default" size="sm" className="ml-auto">
                  {filteredClasses?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingClasses ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredClasses && filteredClasses.length > 0 ? (
                <div className="divide-y divide-surface-100">
                  {filteredClasses.map((cls) => (
                    <button
                      key={cls._id}
                      onClick={() => setSelectedClass(cls._id)}
                      className={cn(
                        'w-full text-left p-4 transition-all hover:bg-surface-50',
                        selectedClass === cls._id && 'bg-primary-50 border-l-4 border-l-primary-500'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            selectedClass === cls._id
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-surface-100 text-surface-500'
                          )}
                        >
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-surface-900 truncate">{cls.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                cls.status === 'ACTIVE'
                                  ? 'success'
                                  : cls.status === 'DRAFT'
                                  ? 'default'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {cls.status}
                            </Badge>
                            <span className="text-xs text-surface-400">{cls.classCode}</span>
                          </div>
                          {cls.schedule && cls.schedule.length > 0 && (
                            <p className="text-xs text-surface-500 mt-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {cls.schedule[0].day}, {cls.schedule[0].startTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="book"
                  title="No classes found"
                  description={searchQuery ? 'Try adjusting your search.' : 'No classes assigned yet.'}
                  compact
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {selectedClass ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {selectedClassDetails?.title}
                      </CardTitle>
                      <CardDescription>
                        {selectedClassDetails?.classCode} • Semester {selectedClassDetails?.semester}
                      </CardDescription>
                    </div>
                    <Badge variant="primary" size="lg">
                      {isLoadingStudents ? '-' : students?.length || 0} Students
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingStudents ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-surface-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : students && students.length > 0 ? (
                    <motion.div
                      variants={listVariants}
                      initial="initial"
                      animate="animate"
                      className="space-y-3"
                    >
                      {students.map((student, index) => (
                        <motion.div
                          key={student._id || index}
                          variants={listItemVariants}
                          className="flex items-center gap-4 p-4 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                            {(student.studentId?.name || 'S')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-surface-900">
                              {student.studentId?.name || 'Unknown Student'}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-surface-500 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {student.studentId?.email || 'No email'}
                              </span>
                              {student.studentId?.enrollmentNo && (
                                <span className="text-xs text-surface-400">
                                  ID: {student.studentId.enrollmentNo}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={student.status === 'APPROVED' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {student.status}
                            </Badge>
                            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                              View
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <EmptyState
                      icon="users"
                      title="No students enrolled"
                      description="This class doesn't have any enrolled students yet."
                    />
                  )}
                </CardContent>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-surface-400" />
                </div>
                <h3 className="font-medium text-surface-900 mb-1">Select a Class</h3>
                <p className="text-sm text-surface-500 max-w-sm">
                  Choose a class from the list to view enrolled students and manage attendance.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
