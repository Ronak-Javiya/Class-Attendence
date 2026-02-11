/**
 * Auth Store (Zustand) — Manages user session state.
 * Stores user info (role, name, id) and tokens.
 * Persist is handled via localStorage directly.
 */
import { create } from 'zustand'
import api from '../api/axios'

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'HOD'

interface User {
    id: string
    name: string
    email: string
    role: UserRole
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    initialize: () => void
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        const { accessToken, refreshToken, userId, role, fullName } = res.data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        set({
            user: {
                id: userId,
                name: fullName,
                email, // Use passed email since backend doesn't return it in login response by default
                role: role,
            },
            isAuthenticated: true,
        })
    },

    logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuthenticated: false })
    },

    initialize: () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            set({ isLoading: false })
            return
        }

        // Decode JWT payload to extract user info (no verification — backend validates)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            set({
                user: {
                    id: payload.userId,
                    name: payload.name || payload.email,
                    email: payload.email,
                    role: payload.role,
                },
                isAuthenticated: true,
                isLoading: false,
            })
        } catch {
            localStorage.removeItem('accessToken')
            set({ isLoading: false })
        }
    },
}))

export default useAuthStore
