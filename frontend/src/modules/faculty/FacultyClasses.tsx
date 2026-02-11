/**
 * FacultyClasses — View enrolled students per class.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { listVariants, listItemVariants } from '../../shared/motion/variants'
import api from '../../api/axios'
import { Users, BookOpen } from 'lucide-react'

export default function FacultyClasses() {
    const [selectedClass, setSelectedClass] = useState('')

    const { data: classes } = useQuery({
        queryKey: ['faculty-classes'],
        queryFn: () => api.get('/classes?role=FACULTY').then((r) => r.data.data),
    })

    const { data: students } = useQuery({
        queryKey: ['class-students', selectedClass],
        queryFn: () => api.get(`/classes/${selectedClass}/students`).then((r) => r.data.data),
        enabled: !!selectedClass,
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">My Classes</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Class List */}
                <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
                    {(classes ?? []).map((cls: any) => (
                        <motion.button
                            key={cls._id}
                            variants={listItemVariants}
                            onClick={() => setSelectedClass(cls._id)}
                            className={`w-full text-left bg-white rounded-lg p-4 border transition-colors ${selectedClass === cls._id ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen size={18} className="text-primary-600" />
                                <div>
                                    <p className="font-medium text-surface-800 text-sm">{cls.title}</p>
                                    <p className="text-xs text-surface-500">{cls.classCode}</p>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Student List */}
                <div className="lg:col-span-2">
                    {selectedClass ? (
                        <div className="bg-white rounded-xl p-5 border border-surface-200">
                            <h3 className="text-sm font-semibold text-surface-800 mb-4 flex items-center gap-2">
                                <Users size={16} /> Enrolled Students
                            </h3>
                            <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-2">
                                {(students ?? []).map((s: any, i: number) => (
                                    <motion.div
                                        key={s._id || i}
                                        variants={listItemVariants}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-xs">
                                            {(s.studentId?.name || 'S')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-surface-800">{s.studentId?.name || 'Student'}</p>
                                            <p className="text-xs text-surface-400">{s.studentId?.email || ''}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {!students?.length && <p className="text-sm text-surface-400 text-center py-4">No students enrolled.</p>}
                            </motion.div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-surface-400 text-sm">Select a class to view students.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
