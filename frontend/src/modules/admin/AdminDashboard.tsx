import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Building2, BarChart3, Loader2, BookOpen } from 'lucide-react';
import { StatCard } from '@/components/composite/StatCard';
import { Card, CardContent } from '@/components/primitives/Card';
import { EmptyState } from '@/components/composite/EmptyState';
import { CircularProgress } from '@/components/primitives/CircularProgress';
import { listVariants } from '@/lib/animations';
import api from '@/api/axios';

interface AdminStats {
    totalUsers: number;
    departments: number;
    activeClasses: number;
    overrides: number;
}

interface Department {
    _id: string;
    name: string;
    code: string;
}

interface ClassItem {
    _id: string;
    name: string;
    code: string;
    department_id?: { _id: string; name: string; code: string };
    students: string[];
}

interface ClassAttendance {
    classId: string;
    rate: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/stats/admin').then(r => setStats(r.data)).catch(() => null),
            api.get('/departments').then(r => setDepartments(r.data)).catch(() => []),
            api.get('/classes/available').then(r => setClasses(r.data)).catch(() => []),
            api.get('/stats/class-attendance').then(r => setClassAttendance(r.data)).catch(() => [])
        ]).finally(() => setLoading(false));
    }, []);

    const getClassesForDept = (deptId: string) => classes.filter(c => c.department_id?._id === deptId);

    const getDeptAttendance = (deptId: string) => {
        const deptClasses = getClassesForDept(deptId);
        if (deptClasses.length === 0) return 0;
        const rates = deptClasses.map(c => {
            const found = classAttendance.find(ca => ca.classId === c._id);
            return found?.rate ?? 0;
        });
        return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Admin Dashboard</h1>
                <p className="text-surface-500 text-sm mt-1">College overview — departments, classes, and users</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <motion.div variants={listVariants} initial="initial" animate="animate"
                        className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<Users className="w-6 h-6" />}
                            iconBgColor="#EFF6FF" iconColor="#2563EB" />
                        <StatCard title="Departments" value={stats?.departments ?? 0} icon={<Building2 className="w-6 h-6" />}
                            iconBgColor="#F0FDF4" iconColor="#16A34A" />
                        <StatCard title="Active Classes" value={stats?.activeClasses ?? 0} icon={<BarChart3 className="w-6 h-6" />}
                            iconBgColor="#FFFBEB" iconColor="#D97706" />
                    </motion.div>

                    {/* Departments — Card Grid */}
                    <div>
                        <h2 className="text-lg font-bold text-surface-900 mb-4">College Departments</h2>
                        {departments.length === 0 ? (
                            <EmptyState icon="clipboard" title="No departments" description="Create departments to organize your college." compact />
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {departments.map(dept => {
                                    const deptClasses = getClassesForDept(dept._id);
                                    const attendanceRate = getDeptAttendance(dept._id);
                                    return (
                                        <Card key={dept._id}
                                            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                            onClick={() => navigate(`/admin/departments/${dept._id}`)}>
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                                <Building2 className="w-4 h-4 text-primary-600" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-surface-900 truncate">{dept.name}</p>
                                                                <p className="text-xs text-surface-500">Code: {dept.code}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-primary-600 font-medium mt-1">
                                                            {deptClasses.length} classes · {deptClasses.reduce((sum, c) => sum + (c.students?.length || 0), 0)} students
                                                        </p>
                                                    </div>
                                                    <CircularProgress value={attendanceRate} size={44} strokeWidth={4} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
