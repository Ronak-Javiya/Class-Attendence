/**
 * PrivateRoute — Role-based route guard.
 * Redirects unauthenticated users to /login.
 * Redirects users without correct role to /unauthorized.
 */
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore, { type UserRole } from '../store/authStore'

interface Props {
    allowedRoles: UserRole[]
}

export default function PrivateRoute({ allowedRoles }: Props) {
    const { isAuthenticated, user, isLoading } = useAuthStore()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="skeleton w-10 h-10 rounded-full" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}
