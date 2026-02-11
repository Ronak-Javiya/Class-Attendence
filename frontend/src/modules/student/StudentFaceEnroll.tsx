/**
 * StudentFaceEnroll — Face enrollment UI for student.
 * Upload 3+ selfies → sends to backend → backend calls Python AI → stores embedding.
 * Upgraded for 10x premium biometric experience.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import api from '../../api/axios'
import { Camera, CheckCircle, Upload, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function StudentFaceEnroll() {
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const mutation = useMutation({
        mutationFn: async () => {
            const form = new FormData()
            files.forEach((f) => form.append('images', f))
            return api.post('/face/enroll', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? [])
        setFiles(selected)
        setPreviews(selected.map((f) => URL.createObjectURL(f)))
    }

    const handleSubmit = () => {
        if (files.length < 3) return
        mutation.mutate()
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Security Clearance</h2>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Biometric <span className="text-gradient">Activation</span>
                </h1>
                <p className="text-slate-500 font-medium">Calibrate your neural attendance link through high-fidelity face mapping.</p>
            </div>

            {mutation.isSuccess ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass bg-white/70 border-emerald-200/50 rounded-3xl p-12 text-center shadow-xl shadow-emerald-500/10"
                >
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 text-white">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Biometrics Synchronized</h3>
                    <p className="text-emerald-700 font-medium max-w-sm mx-auto">
                        Your identification markers have been successfully mapped to the campus core.
                        <span className="block mt-2 text-xs opacity-75">Processed {mutation.data?.data?.data?.imagesUsed ?? '3'} high-fidelity perspectives.</span>
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Instructions Card */}
                    <div className="bg-amber-500/5 border border-amber-200/30 rounded-2xl p-6 flex gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Security Protocol</h4>
                            <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                Upload precisely 3 or more clear selfies. Ensure direct lighting and no obstructions for 99.9% verification accuracy.
                            </p>
                        </div>
                    </div>

                    {/* Upload Matrix */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Interactive Dropper */}
                        <label className="group relative cursor-pointer">
                            <div className="absolute inset-0 bg-indigo-600/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center transition-all group-hover:border-indigo-400 group-hover:bg-white group-hover:scale-[1.01] premium-shadow">
                                <motion.div
                                    animate={{
                                        y: [0, -4, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white"
                                >
                                    <Camera size={36} />
                                </motion.div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">Capture Visuals</h3>
                                <p className="text-sm text-slate-500 max-w-[200px] mx-auto font-medium">Drop high-res captures or click to select from archive.</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </label>

                        {/* Preview Track */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Capture Buffer</h3>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">{previews.length} / 3 Required</span>
                            </div>

                            {previews.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {previews.map((src, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md group"
                                        >
                                            <img
                                                src={src}
                                                alt={`Face ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-40 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                                    Buffer Empty
                                </div>
                            )}

                            {files.length > 0 && files.length < 3 && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <AlertTriangle size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-700 uppercase">Input Insufficient: Need {3 - files.length} more frames</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Feedback */}
                    {mutation.isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3"
                        >
                            <AlertTriangle size={18} className="text-rose-500" />
                            <p className="text-xs font-bold text-rose-700">
                                {(mutation.error as any)?.response?.data?.message || 'Transmission failed. Ensure network integrity and retry.'}
                            </p>
                        </motion.div>
                    )}

                    {/* Submission Core */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Mapping Status</p>
                            <p className="text-xs font-medium text-slate-500">{mutation.isPending ? 'Activating AI Engines...' : 'Idle - Awaiting Data'}</p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={files.length < 3 || mutation.isPending}
                            className="relative group overflow-hidden px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none flex items-center gap-3 overflow-hidden"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span className="font-bold uppercase tracking-widest text-xs">Computing...</span>
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                    <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                                    <span className="font-bold uppercase tracking-widest text-xs">Activate Enrollment</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
