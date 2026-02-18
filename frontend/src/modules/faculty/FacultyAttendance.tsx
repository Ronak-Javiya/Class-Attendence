/**
 * FacultyAttendance — Modern attendance taking wizard
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/primitives/Card'

import { Button } from '@/components/primitives/Button'
import { Select } from '@/components/primitives/Select'
import { EmptyState } from '@/components/composite/EmptyState'
import api from '@/api/axios'
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  GraduationCap,
  AlertCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'select' | 'upload' | 'processing' | 'done'

interface Class {
  _id: string
  title: string
  classCode: string
  status: string
}

interface TimetableSlot {
  _id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function FacultyAttendance() {
  const [step, setStep] = useState<Step>('select')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [lectureId, setLectureId] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['faculty-classes'],
    queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
  })

  const { data: slots, isLoading: isLoadingSlots } = useQuery<TimetableSlot[]>({
    queryKey: ['class-slots', selectedClass],
    queryFn: () => api.get(`/classes/${selectedClass}/timetable`).then((r) => r.data.data),
    enabled: !!selectedClass,
  })

  const createLecture = useMutation({
    mutationFn: () =>
      api.post('/lectures', { classId: selectedClass, timetableSlotId: selectedSlot }),
    onSuccess: (res) => {
      setLectureId(res.data.data._id)
      setStep('upload')
    },
  })

  const uploadPhotos = useMutation({
    mutationFn: () => {
      setStep('processing')
      const form = new FormData()
      files.forEach((f) => form.append('photos', f))
      return api.post(`/lectures/${lectureId}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => setStep('done'),
    onError: () => setStep('upload'),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 0) {
      setFiles([...files, ...selected])
      setPreviews([...previews, ...selected.map((f) => URL.createObjectURL(f))])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setStep('select')
    setFiles([])
    setPreviews([])
    setLectureId('')
    setSelectedClass('')
    setSelectedSlot('')
  }

  const selectedClassDetails = classes?.find((c) => c._id === selectedClass)
  const selectedSlotDetails = slots?.find((s) => s._id === selectedSlot)

  const steps = [
    { id: 'select', label: 'Select Class', icon: GraduationCap },
    { id: 'upload', label: 'Upload Photos', icon: Camera },
    { id: 'processing', label: 'Processing', icon: Loader2 },
    { id: 'done', label: 'Complete', icon: CheckCircle },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Take Attendance"
        description="Use AI-powered face recognition to automatically mark attendance"
      />

      {/* Progress Steps */}
      <Card variant="flat" padding="md">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const Icon = s.icon
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      isCurrent
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : isActive
                        ? 'bg-success-100 text-success-600'
                        : 'bg-surface-100 text-surface-400'
                    )}
                  >
                    {isActive && index < currentStepIndex ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium mt-2',
                      isCurrent ? 'text-primary-600' : isActive ? 'text-surface-700' : 'text-surface-400'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-4 transition-all',
                      index < currentStepIndex ? 'bg-success-200' : 'bg-surface-200'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Select Class & Slot */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Select Class & Time Slot
                </CardTitle>
                <CardDescription>
                  Choose the class and schedule slot for this lecture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Class
                  </label>
                  {isLoadingClasses ? (
                    <div className="h-11 bg-surface-100 rounded-lg animate-pulse" />
                  ) : (
                    <Select
                      options={[
                        { value: '', label: 'Select a class' },
                        ...(classes?.filter((c) => c.status === 'ACTIVE').map((c) => ({
                          value: c._id,
                          label: `${c.title} (${c.classCode})`,
                        })) || []),
                      ]}
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value)
                        setSelectedSlot('')
                      }}
                    />
                  )}
                </div>

                {/* Time Slot Selection */}
                {selectedClass && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Time Slot
                    </label>
                    {isLoadingSlots ? (
                      <div className="h-11 bg-surface-100 rounded-lg animate-pulse" />
                    ) : slots && slots.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {slots.map((slot) => (
                          <button
                            key={slot._id}
                            onClick={() => setSelectedSlot(slot._id)}
                            className={cn(
                              'p-4 rounded-lg border-2 text-left transition-all',
                              selectedSlot === slot._id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-surface-200 hover:border-primary-300'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center',
                                  selectedSlot === slot._id
                                    ? 'bg-primary-100 text-primary-600'
                                    : 'bg-surface-100 text-surface-500'
                                )}
                              >
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-surface-900">
                                  {DAYS_OF_WEEK[slot.dayOfWeek]}
                                </p>
                                <p className="text-sm text-surface-500">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Card variant="flat" padding="md">
                        <EmptyState
                          icon="calendar"
                          title="No schedule found"
                          description="This class doesn't have any timetable slots configured."
                          compact
                        />
                      </Card>
                    )}
                  </motion.div>
                )}

                {/* Selected Summary */}
                {selectedClass && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary-50 rounded-lg border border-primary-200"
                  >
                    <h4 className="font-medium text-primary-900 mb-2">Ready to Create Lecture</h4>
                    <div className="space-y-1 text-sm text-primary-700">
                      <p>
                        <span className="font-medium">Class:</span> {selectedClassDetails?.title}
                      </p>
                      <p>
                        <span className="font-medium">Schedule:</span>{' '}
                        {DAYS_OF_WEEK[selectedSlotDetails?.dayOfWeek || 0]},{' '}
                        {selectedSlotDetails?.startTime} - {selectedSlotDetails?.endTime}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {createLecture.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error-700">
                      {(createLecture.error as any)?.response?.data?.message ||
                        'Failed to create lecture. Please try again.'}
                    </p>
                  </motion.div>
                )}

                {/* Action */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => createLecture.mutate()}
                    disabled={!selectedClass || !selectedSlot || createLecture.isPending}
                    isLoading={createLecture.isPending}
                    loadingText="Creating..."
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    size="lg"
                  >
                    Create Lecture
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Upload Photos */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upload Classroom Photos
                </CardTitle>
                <CardDescription>
                  Upload clear photos of the classroom showing all students' faces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Zone */}
                <label className="block cursor-pointer">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-12 text-center transition-all',
                      'hover:border-primary-400 hover:bg-primary-50/50',
                      'border-surface-300 bg-surface-50'
                    )}
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-primary-600" />
                    </div>
                    <p className="font-medium text-surface-900 mb-1">Click to upload photos</p>
                    <p className="text-sm text-surface-500">or drag and drop</p>
                    <p className="text-xs text-surface-400 mt-4">
                      Upload multiple angles for better accuracy
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Photo Guidelines */}
                <div className="p-4 bg-info-50 rounded-lg border border-info-200">
                  <h4 className="font-medium text-info-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Photo Guidelines
                  </h4>
                  <ul className="text-sm text-info-700 space-y-1">
                    <li>• Ensure all students are clearly visible</li>
                    <li>• Good lighting with no harsh shadows</li>
                    <li>• Capture from the front of the classroom</li>
                    <li>• Upload multiple angles if needed</li>
                  </ul>
                </div>

                {/* Preview Gallery */}
                {previews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-surface-900">
                        Selected Photos ({files.length})
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setPreviews([]) }}>
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {previews.map((src, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square rounded-lg overflow-hidden border border-surface-200 group"
                        >
                          <img
                            src={src}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                  <Button
                    variant="secondary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => setStep('select')}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => uploadPhotos.mutate()}
                    disabled={files.length === 0}
                    isLoading={uploadPhotos.isPending}
                    loadingText="Processing..."
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    size="lg"
                  >
                    Start AI Processing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-surface-900 mb-2">Processing Attendance</h3>
                <p className="text-surface-600 mb-8">
                  AI is analyzing {files.length} photo{files.length !== 1 ? 's' : ''} and detecting faces...
                </p>

                {/* Progress bar */}
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 8, ease: 'easeOut' }}
                    className="h-full bg-primary-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-surface-500">This may take a moment</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto border-success-200">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-success-600" />
                </div>
                <h3 className="text-2xl font-bold text-surface-900 mb-2">Attendance Complete!</h3>
                <p className="text-surface-600 mb-8">
                  The lecture has been locked and attendance records have been generated successfully.
                </p>
                <Button onClick={resetForm} size="lg">
                  Take Another Attendance
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
