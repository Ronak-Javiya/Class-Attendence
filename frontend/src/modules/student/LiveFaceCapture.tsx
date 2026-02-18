/**
 * LiveFaceCapture — Interactive camera capture with guided 5-angle face enrollment.
 * Captures: Straight, Left, Right, Top, Bottom angles using device camera.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Camera,
    CheckCircle,
    RefreshCw,
    ChevronRight,
    AlertTriangle,
    Loader2,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Smartphone
} from 'lucide-react'

interface LiveFaceCaptureProps {
    onCaptureComplete: (images: File[]) => void
    onCancel: () => void
}

const ANGLES = [
    { id: 'straight', label: 'Straight', icon: Smartphone, instruction: 'Look straight at the camera', hint: 'Face the camera directly' },
    { id: 'left', label: 'Left', icon: ArrowLeft, instruction: 'Turn your head to the left', hint: 'Turn ~30° to your left' },
    { id: 'right', label: 'Right', icon: ArrowRight, instruction: 'Turn your head to the right', hint: 'Turn ~30° to your right' },
    { id: 'top', label: 'Top', icon: ArrowUp, instruction: 'Tilt your head up slightly', hint: 'Look up ~30°' },
    { id: 'bottom', label: 'Bottom', icon: ArrowDown, instruction: 'Tilt your head down slightly', hint: 'Look down ~30°' }
] as const

export default function LiveFaceCapture({ onCaptureComplete, onCancel }: LiveFaceCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [currentStep, setCurrentStep] = useState(0)
    const [capturedImages, setCapturedImages] = useState<{ [key: string]: string }>({})
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const [isCapturing, setIsCapturing] = useState(false)
    const [countdown, setCountdown] = useState(3)

    const currentAngle = ANGLES[currentStep]
    const progress = Object.keys(capturedImages).length
    const isComplete = progress === ANGLES.length

    // Initialize camera
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                })

                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
                setIsInitializing(false)
            } catch (err) {
                setCameraError('Could not access camera. Please ensure permissions are granted.')
                setIsInitializing(false)
            }
        }

        initCamera()

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Auto-capture countdown
    useEffect(() => {
        if (!isCapturing || countdown === 0) return

        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [isCapturing, countdown])

    // Capture when countdown reaches 0
    useEffect(() => {
        if (isCapturing && countdown === 0) {
            performCapture()
        }
    }, [isCapturing, countdown])

    const performCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx || !video.videoWidth) return

        // Set canvas to match video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

        // Save captured image
        setCapturedImages(prev => ({
            ...prev,
            [currentAngle.id]: dataUrl
        }))

        // Reset capture state
        setIsCapturing(false)
        setCountdown(3)

        // Move to next step or complete
        if (currentStep < ANGLES.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }, [currentAngle.id, currentStep])

    const startCapture = () => {
        setIsCapturing(true)
        setCountdown(3)
    }

    const retakeCurrent = () => {
        setCapturedImages(prev => {
            const newImages = { ...prev }
            delete newImages[currentAngle.id]
            return newImages
        })
        setIsCapturing(false)
        setCountdown(3)
    }

    const handleComplete = () => {
        const files: File[] = []

        ANGLES.forEach((angle, index) => {
            const dataUrl = capturedImages[angle.id]
            if (dataUrl) {
                // Convert data URL to File
                const byteString = atob(dataUrl.split(',')[1])
                const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
                const ab = new ArrayBuffer(byteString.length)
                const ia = new Uint8Array(ab)

                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i)
                }

                const blob = new Blob([ab], { type: mimeString })
                const file = new File([blob], `face_${angle.id}_${index + 1}.jpg`, { type: 'image/jpeg' })
                files.push(file)
            }
        })

        onCaptureComplete(files)
    }

    const hasCapturedCurrent = currentAngle.id in capturedImages

    if (cameraError) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center"
            >
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={28} className="text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-rose-900 mb-2">Camera Access Required</h3>
                <p className="text-rose-700 text-sm mb-6">{cameraError}</p>
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors"
                >
                    Back to Upload
                </button>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Camera size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Live Capture</h3>
                        <p className="text-xs text-slate-500">Step {currentStep + 1} of {ANGLES.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {ANGLES.map((angle, idx) => (
                        <div
                            key={angle.id}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                idx === currentStep
                                    ? 'bg-indigo-600 w-6'
                                    : capturedImages[angle.id]
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-200'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Main Capture Area */}
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden aspect-[4/3] max-w-lg mx-auto">
                {/* Video Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror effect for better UX
                />

                {/* Hidden Canvas for Capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay UI */}
                <AnimatePresence mode="wait">
                    {isInitializing ? (
                        <motion.div
                            key="initializing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/90 flex items-center justify-center"
                        >
                            <div className="text-center">
                                <Loader2 size={40} className="animate-spin text-white mx-auto mb-4" />
                                <p className="text-white font-medium">Initializing Camera...</p>
                            </div>
                        </motion.div>
                    ) : hasCapturedCurrent ? (
                        <motion.div
                            key="captured"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <CheckCircle size={40} className="text-white" />
                            </motion.div>
                        </motion.div>
                    ) : isCapturing ? (
                        <motion.div
                            key="capturing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative">
                                {/* Countdown Ring */}
                                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="4"
                                    />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 1 }}
                                        animate={{ pathLength: 0 }}
                                        transition={{ duration: 3, ease: 'linear' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-5xl font-black text-white">{countdown}</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="instruction"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                    <currentAngle.icon size={28} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{currentAngle.instruction}</p>
                                    <p className="text-white/70 text-sm">{currentAngle.hint}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Face Guide Overlay */}
                {!isInitializing && !hasCapturedCurrent && !isCapturing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-64 border-2 border-dashed border-white/40 rounded-full" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between max-w-lg mx-auto">
                {hasCapturedCurrent ? (
                    <button
                        onClick={retakeCurrent}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                    >
                        <RefreshCw size={18} />
                        Retake
                    </button>
                ) : (
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                )}

                {isComplete ? (
                    <button
                        onClick={handleComplete}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <CheckCircle size={20} />
                        Complete ({progress}/5)
                    </button>
                ) : hasCapturedCurrent ? (
                    <button
                        onClick={() => setCurrentStep(prev => Math.min(prev + 1, ANGLES.length - 1))}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                ) : (
                    <button
                        onClick={startCapture}
                        disabled={isCapturing}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:shadow-none transition-all"
                    >
                        <Camera size={20} />
                        {isCapturing ? 'Capturing...' : 'Capture'}
                    </button>
                )}
            </div>

            {/* Thumbnail Preview */}
            <div className="max-w-lg mx-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Captured Photos</p>
                <div className="grid grid-cols-5 gap-2">
                    {ANGLES.map((angle) => (
                        <div
                            key={angle.id}
                            onClick={() => {
                                if (capturedImages[angle.id]) {
                                    setCurrentStep(ANGLES.findIndex(a => a.id === angle.id))
                                }
                            }}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                angle.id === currentAngle.id
                                    ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                                    : capturedImages[angle.id]
                                    ? 'border-emerald-500'
                                    : 'border-slate-200 bg-slate-50'
                            }`}
                        >
                            {capturedImages[angle.id] ? (
                                <img
                                    src={capturedImages[angle.id]}
                                    alt={angle.label}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <angle.icon size={20} className="text-slate-300" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
