/**
 * AdminReports — Modern reports generation interface
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { Select } from '@/components/primitives/Select'
import { EmptyState } from '@/components/composite/EmptyState'
import api from '@/api/axios'
import {
  FileText,
  Download,
  Users,
  GraduationCap,
  BarChart3,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface GeneratedReport {
  _id: string
  type: string
  format: 'PDF' | 'EXCEL' | 'CSV'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  fileUrl?: string
  parameters: {
    startDate: string
    endDate: string
    classId?: string
    studentId?: string
  }
}

export default function AdminReports() {
  const [reportType, setReportType] = useState<string>('attendance_summary')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [format, setFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('EXCEL')
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: reports, isLoading: isLoadingReports } = useQuery<GeneratedReport[]>({
    queryKey: ['generated-reports'],
    queryFn: () => api.get('/reports').then((r) => r.data.data),
  })

  const { data: classes } = useQuery({
    queryKey: ['classes-list'],
    queryFn: () => api.get('/classes').then((r) => r.data.data),
  })

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      await api.post('/reports/generate', {
        type: reportType,
        format,
        startDate,
        endDate,
        classId: selectedClass || undefined,
      })
      // Refetch reports
      window.location.reload()
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypes = [
    {
      value: 'attendance_summary',
      label: 'Attendance Summary',
      description: 'Overall attendance statistics by class and date range',
      icon: BarChart3,
    },
    {
      value: 'student_attendance',
      label: 'Student Attendance Detail',
      description: 'Individual student attendance records',
      icon: Users,
    },
    {
      value: 'class_attendance',
      label: 'Class Attendance Report',
      description: 'Detailed attendance for a specific class',
      icon: GraduationCap,
    },
    {
      value: 'dispute_summary',
      label: 'Dispute Summary',
      description: 'Overview of all raised and resolved disputes',
      icon: FileText,
    },
  ]

  const formatOptions = [
    { value: 'EXCEL', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
    { value: 'PDF', label: 'PDF Document', icon: FileText },
    { value: 'CSV', label: 'CSV File', icon: FileText },
  ]

  const selectedReportType = reportTypes.find((t) => t.value === reportType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Reports"
        description="Generate and download attendance reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate New Report
              </CardTitle>
              <CardDescription>
                Configure report parameters and generate customized attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">
                  Report Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setReportType(type.value)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          reportType === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-surface-200 hover:border-primary-300'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              reportType === type.value
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-surface-100 text-surface-500'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{type.label}</p>
                            <p className="text-xs text-surface-500 mt-1">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Class Selection (for certain report types) */}
              {(reportType === 'class_attendance' || reportType === 'attendance_summary') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Select Class (Optional)
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'All Classes' },
                      ...(classes?.map((c: any) => ({
                        value: c._id,
                        label: `${c.title} (${c.classCode})`,
                      })) || []),
                    ]}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  />
                </motion.div>
              )}

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">
                  Export Format
                </label>
                <div className="flex gap-3">
                  {formatOptions.map((fmt) => {
                    const Icon = fmt.icon
                    return (
                      <button
                        key={fmt.value}
                        onClick={() => setFormat(fmt.value as 'PDF' | 'EXCEL' | 'CSV')}
                        className={cn(
                          'flex-1 p-3 rounded-lg border-2 text-center transition-all',
                          format === fmt.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-surface-200 hover:border-primary-300'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-6 h-6 mx-auto mb-2',
                            format === fmt.value ? 'text-primary-600' : 'text-surface-400'
                          )}
                        />
                        <p
                          className={cn(
                            'text-sm font-medium',
                            format === fmt.value ? 'text-primary-700' : 'text-surface-600'
                          )}
                        >
                          {fmt.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
                <h4 className="font-medium text-surface-900 mb-2">Report Summary</h4>
                <div className="space-y-1 text-sm text-surface-600">
                  <p>
                    <span className="font-medium">Type:</span> {selectedReportType?.label}
                  </p>
                  <p>
                    <span className="font-medium">Date Range:</span>{' '}
                    {startDate && endDate
                      ? `${formatDate(startDate)} to ${formatDate(endDate)}`
                      : 'Not specified'}
                  </p>
                  <p>
                    <span className="font-medium">Format:</span> {format}
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full"
                disabled={!startDate || !endDate || isGenerating}
                isLoading={isGenerating}
                loadingText="Generating..."
                leftIcon={<FileText className="w-5 h-5" />}
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Reports
              </CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-surface-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="p-4 rounded-lg border border-surface-200 hover:border-surface-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-surface-900 text-sm">
                            {report.type.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-surface-500 mt-1">
                            {formatDate(report.createdAt)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                report.status === 'COMPLETED'
                                  ? 'success'
                                  : report.status === 'FAILED'
                                  ? 'error'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {report.status === 'COMPLETED' && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {report.status === 'PENDING' && (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              )}
                              {report.status === 'FAILED' && (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {report.status}
                            </Badge>
                            <Badge variant="default" size="sm">
                              {report.format}
                            </Badge>
                          </div>
                        </div>
                        {report.status === 'COMPLETED' && report.fileUrl && (
                          <Button size="sm" variant="ghost" leftIcon={<Download className="w-4 h-4" />}>
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="file"
                  title="No reports yet"
                  description="Generated reports will appear here"
                  compact
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
