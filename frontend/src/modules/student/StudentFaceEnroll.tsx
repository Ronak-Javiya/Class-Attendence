/**
 * StudentFaceEnroll — Modern face enrollment UI for students
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/primitives/Card'
import { Badge } from '@/components/primitives/Badge'
import { Button } from '@/components/primitives/Button'
import { EmptyState } from '@/components/composite/EmptyState'
import api from '@/api/axios'
import {
  CheckCircle,
  Upload,
  Loader2,
  AlertTriangle,
  Shield,
  Camera,
  Image,
  X,
  Check,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CaptureMode = 'live' | 'upload'

const MIN_IMAGES = 5
const ANGLES = ['Front', 'Left', 'Right', 'Up', 'Down']

export default function StudentFaceEnroll() {
  const [captureMode, setCaptureMode] = useState<CaptureMode>('live')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const mutation = useMutation({
    mutationFn: async (uploadFiles: File[]) => {
      const form = new FormData()
      uploadFiles.forEach((f) => form.append('images', f))
      return api.post('/face/enroll', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
  })

  const handleLiveCaptureComplete = (capturedFiles: File[]) => {
    setFiles(capturedFiles)
    setPreviews(capturedFiles.map((f) => URL.createObjectURL(f)))
    mutation.mutate(capturedFiles)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 0) {
      const newFiles = [...files, ...selected]
      setFiles(newFiles)
      setPreviews([...previews, ...selected.map((f) => URL.createObjectURL(f))])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleSubmit = () => {
    if (files.length < MIN_IMAGES) return
    mutation.mutate(files)
  }

  const handleSwitchMode = (mode: CaptureMode) => {
    setCaptureMode(mode)
    setFiles([])
    setPreviews([])
    setCurrentStep(0)
  }

  if (mutation.isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-success-600" />
          </div>
          <h2 className="text-3xl font-bold text-surface-900 mb-4">Enrollment Complete!</h2>
          <p className="text-surface-600 max-w-md mx-auto mb-8">
            Your face has been successfully enrolled in the system. You can now use face recognition for attendance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="success" size="lg">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {mutation.data?.data?.data?.imagesUsed || files.length} photos processed
            </Badge>
          </div>
          <Button className="mt-8" onClick={() => window.location.reload()}>
            Enroll More Photos
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Face Enrollment"
        description="Upload photos for AI-powered face recognition attendance"
      />

      {/* Mode Selection */}
      {!mutation.isPending && (
        <Card variant="flat" padding="sm">
          <div className="grid grid-cols-2 gap-2 p-1">
            <button
              onClick={() => handleSwitchMode('live')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                captureMode === 'live'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-surface-600 hover:bg-surface-100'
              )}
            >
              <Camera className="w-4 h-4" />
              Live Camera
              <Badge variant="primary" size="sm" className="ml-1 bg-white/20 text-white">
                Recommended
              </Badge>
            </button>
            <button
              onClick={() => handleSwitchMode('upload')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                captureMode === 'upload'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-surface-600 hover:bg-surface-100'
              )}
            >
              <Image className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-info-200 bg-info-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-info-600" />
            </div>
            <div>
              <h3 className="font-medium text-info-900">Enrollment Requirements</h3>
              <p className="text-sm text-info-700 mt-1">
                {captureMode === 'live'
                  ? `Capture ${MIN_IMAGES} photos from different angles: front, left, right, up, and down. Ensure good lighting and a neutral background.`
                  : `Upload at least ${MIN_IMAGES} clear photos showing your face from different angles (front, left, right, up, down).`}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-info-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Well-lit environment with no shadows on face
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Neutral expression, look directly at camera
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Remove glasses, hats, or face coverings
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {captureMode === 'live' && !mutation.isPending ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Guided Face Capture
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {ANGLES.map((angle, index) => (
                      <div key={angle} className="flex items-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                            index < currentStep
                              ? 'bg-success-100 text-success-600'
                              : index === currentStep
                                ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                : 'bg-surface-100 text-surface-400'
                          )}
                        >
                          {index < currentStep ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < ANGLES.length - 1 && (
                          <div
                            className={cn(
                              'w-12 h-1 mx-1 transition-all',
                              index < currentStep ? 'bg-success-200' : 'bg-surface-200'
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-lg font-medium text-surface-700">
                    Step {currentStep + 1} of {MIN_IMAGES}: Look{' '}
                    <span className="text-primary-600">{ANGLES[currentStep]}</span>
                  </p>
                </div>

                {/* Camera Placeholder */}
                <div className="aspect-video bg-surface-900 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Camera Preview</p>
                    <p className="text-sm opacity-75">Position your face in the center</p>
                  </div>
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-64 border-2 border-dashed border-white/30 rounded-full" />
                  </div>
                </div>

                {/* Capture Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    leftIcon={<Camera className="w-5 h-5" />}
                    onClick={() => {
                      if (currentStep < MIN_IMAGES - 1) {
                        setCurrentStep(currentStep + 1)
                      } else {
                        // Simulate capture completion
                        handleLiveCaptureComplete([])
                      }
                    }}
                  >
                    Capture Photo {currentStep + 1}/{MIN_IMAGES}
                  </Button>
                </div>

                {/* Preview Strip */}
                {currentStep > 0 && (
                  <div className="mt-8 pt-6 border-t border-surface-100">
                    <p className="text-sm font-medium text-surface-700 mb-4">Captured Photos</p>
                    <div className="flex gap-3">
                      {Array.from({ length: currentStep }).map((_, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 rounded-lg bg-success-100 flex items-center justify-center"
                        >
                          <Check className="w-8 h-8 text-success-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : captureMode === 'upload' && !mutation.isPending ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      <p className="text-xs text-surface-400 mt-4">PNG, JPG up to 5MB each</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Error Display */}
                  {mutation.isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-error-700">
                        {(mutation.error as any)?.response?.data?.message ||
                          'Upload failed. Please try again.'}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Preview Gallery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Preview
                    </span>
                    <Badge
                      variant={previews.length >= MIN_IMAGES ? 'success' : 'default'}
                      size="sm"
                    >
                      {previews.length} / {MIN_IMAGES} Required
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previews.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {previews.map((src, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square rounded-lg overflow-hidden border border-surface-200 group"
                        >
                          <img
                            src={src}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile(i)}
                            className="absolute top-2 right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                            <span className="text-white text-xs font-medium">
                              {ANGLES[i] || `Photo ${i + 1}`}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon="image"
                      title="No photos yet"
                      description="Upload photos to see them here"
                      compact
                    />
                  )}

                  {files.length > 0 && files.length < MIN_IMAGES && (
                    <div className="mt-4 p-3 rounded-lg bg-warning-50 border border-warning-200 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning-600" />
                      <p className="text-sm text-warning-700">
                        Need {MIN_IMAGES - files.length} more photo
                        {MIN_IMAGES - files.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submit Section */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-surface-600">
                      {mutation.isPending
                        ? 'Processing your photos...'
                        : `${files.length} of ${MIN_IMAGES} required photos selected`}
                    </p>
                    {files.length >= MIN_IMAGES && (
                      <p className="text-sm text-success-600 mt-1">
                        <Check className="w-4 h-4 inline mr-1" />
                        Ready to enroll
                      </p>
                    )}
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={files.length < MIN_IMAGES || mutation.isPending}
                    isLoading={mutation.isPending}
                    loadingText="Processing..."
                    leftIcon={<Shield className="w-5 h-5" />}
                  >
                    Complete Enrollment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-2">Processing Enrollment</h2>
            <p className="text-surface-600 max-w-md mx-auto">
              Our AI is analyzing your photos and creating a unique face embedding. This may take a
              moment...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
