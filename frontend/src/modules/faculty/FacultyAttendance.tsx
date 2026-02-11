/**
 * FacultyAttendance — Create lecture & upload classroom photos.
 * Handles the full flow: select class → create lecture → upload photos → AI processing.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../api/axios'
import { Camera, Upload, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import UploadArea from '../../shared/ui/UploadArea'

type Step = 'select' | 'upload' | 'processing' | 'done'

export default function FacultyAttendance() {
    const [step, setStep] = useState<Step>('select')
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSlot, setSelectedSlot] = useState('')
    const [lectureId, setLectureId] = useState('')
    const [files, setFiles] = useState<File[]>([])

    const { data: classes } = useQuery({
        queryKey: ['faculty-classes'],
        queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
    })

    const { data: slots } = useQuery({
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

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Take Attendance</h1>

            <AnimatePresence mode="wait">
                {/* Step 1: Select Class & Slot */}
                {step === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white rounded-xl p-6 border border-surface-200 max-w-lg"
                    >
                        <h3 className="text-sm font-semibold text-surface-800 mb-4">1. Select Class & Time Slot</h3>

                        <select
                            value={selectedClass}
                            onChange={(e) => { setSelectedClass(e.target.value); setSelectedSlot(''); }}
                            className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">— Select class —</option>
                            {(classes ?? []).filter((c: any) => c.status === 'ACTIVE').map((c: any) => (
                                <option key={c._id} value={c._id}>{c.title} ({c.classCode})</option>
                            ))}
                        </select>

                        {slots && (
                            <select
                                value={selectedSlot}
                                onChange={(e) => setSelectedSlot(e.target.value)}
                                className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">— Select time slot —</option>
                                {(slots ?? []).map((s: any) => (
                                    <option key={s._id} value={s._id}>
                                        Day {s.dayOfWeek} • {s.startTime}–{s.endTime}
                                    </option>
                                ))}
                            </select>
                        )}

                        {createLecture.isError && (
                            <p className="text-sm text-red-600 mb-3">
                                {(createLecture.error as any)?.response?.data?.message || 'Failed to create lecture.'}
                            </p>
                        )}

                        <button
                            onClick={() => createLecture.mutate()}
                            disabled={!selectedClass || !selectedSlot || createLecture.isPending}
                            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {createLecture.isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                            Create Lecture
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Upload Photos */}
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white rounded-xl p-8 border border-surface-200 max-w-xl"
                    >
                        <h3 className="text-sm font-semibold text-surface-800 mb-6 uppercase tracking-wider">2. Upload Classroom Photos</h3>

                        <UploadArea
                            onFilesSelected={setFiles}
                            label="Upload Classroom Photos for AI"
                        />

                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-4 bg-surface-50 rounded-lg flex items-center justify-between border border-surface-200"
                            >
                                <div className="flex items-center gap-3">
                                    <Camera className="text-primary-600" size={20} />
                                    <span className="text-sm font-medium text-surface-700">{files.length} Photo(s) ready</span>
                                </div>
                                <button
                                    onClick={() => setFiles([])}
                                    className="text-xs text-red-600 hover:underline font-medium"
                                >
                                    Clear
                                </button>
                            </motion.div>
                        )}

                        <button
                            onClick={() => uploadPhotos.mutate()}
                            disabled={files.length === 0}
                            className="mt-8 w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Upload size={20} /> Start AI Processing
                        </button>
                    </motion.div>
                )}

                {/* Step 3: Processing */}
                {step === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl p-10 border border-surface-200 text-center max-w-lg"
                    >
                        <Loader2 size={48} className="text-primary-500 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-surface-800 mb-2">Processing Attendance</h3>
                        <p className="text-sm text-surface-500">
                            AI is detecting faces and generating attendance records...
                        </p>

                        {/* Progress bar animation */}
                        <div className="mt-6 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: '90%' }}
                                transition={{ duration: 8, ease: 'easeOut' }}
                                className="h-full bg-primary-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Done */}
                {step === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center max-w-lg"
                    >
                        <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-emerald-800 mb-2">Attendance Generated!</h3>
                        <p className="text-sm text-emerald-600 mb-4">Lecture has been locked and attendance recorded.</p>
                        <button
                            onClick={() => { setStep('select'); setFiles([]); setLectureId(''); setSelectedClass(''); setSelectedSlot(''); }}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
                        >
                            Take Another
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
