/**
 * Axios API Client.
 * - Base URL uses Vite proxy (/api → backend:5000/api).
 * - Attaches JWT token from localStorage.
 * - Handles 401 → redirect to login.
 */
import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
