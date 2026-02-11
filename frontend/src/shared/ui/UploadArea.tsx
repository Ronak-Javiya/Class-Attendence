/**
 * UploadArea — Reusable drag-and-drop area with pulsing border.
 * Upgraded for premium visuals and refined interaction.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, UploadCloud, CheckCircle2 } from 'lucide-react'

interface UploadAreaProps {
    onFilesSelected: (files: File[]) => void
    multiple?: boolean
    accept?: string
    label?: string
}

export default function UploadArea({
    onFilesSelected,
    multiple = true,
    accept = 'image/*',
    label = 'Drop classroom photos here'
}: UploadAreaProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploaded, setIsUploaded] = useState(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files))
            setIsUploaded(true)
            setTimeout(() => setIsUploaded(false), 3000)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length > 0) {
            onFilesSelected(files)
            setIsUploaded(true)
            setTimeout(() => setIsUploaded(false), 3000)
        }
    }

    return (
        <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="block relative cursor-pointer group"
        >
            <motion.div
                animate={{
                    borderColor: isDragging ? '#6366f1' : '#e2e8f0',
                    backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                }}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 backdrop-blur-sm
                    ${isDragging ? 'scale-[1.01] shadow-xl shadow-indigo-500/10' : 'hover:border-indigo-300 hover:bg-white'}`}
            >
                <motion.div
                    animate={isUploaded ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors duration-300
                        ${isUploaded ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}
                >
                    {isUploaded ? <CheckCircle2 size={36} /> : isDragging ? <UploadCloud size={36} className="animate-bounce" /> : <Camera size={36} />}
                </motion.div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 transition-colors group-hover:text-indigo-600">
                    {isUploaded ? 'Photos Buffered' : isDragging ? 'Release to Upload' : label}
                </h3>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                    {isUploaded ? 'Verification process initiated...' : 'Professional AI-ready image buffering for high-fidelity attendance mapping.'}
                </p>

                <div className="mt-6 flex items-center justify-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        Auto-processing active
                    </span>
                </div>

                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                />
            </motion.div>
        </label>
    )
}
