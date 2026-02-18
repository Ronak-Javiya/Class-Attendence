/**
 * LoginPage — Modern authentication screen
 * Professional design with clean aesthetics
 */

import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Card, CardContent } from '@/components/primitives/Card';
import {
  GraduationCap,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { scaleVariants, fadeVariants } from '@/lib/animations';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roleRoutes: Record<string, string> = {
          STUDENT: '/student',
          FACULTY: '/faculty',
          ADMIN: '/admin',
          HOD: '/hod',
        };
        navigate(roleRoutes[payload.role] || '/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* Content */}
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          className="relative z-10 flex flex-col justify-center px-12 xl:px-24"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/30"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl xl:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Smart Attendance<br />
            <span className="text-primary-200">Management System</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/80 max-w-xl leading-relaxed"
          >
            Streamline attendance tracking with AI-powered facial recognition. 
            Designed for modern educational institutions.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-6"
          >
            {[
              { label: 'AI-Powered', desc: 'Facial recognition' },
              { label: 'Real-time', desc: 'Instant attendance' },
              { label: 'Secure', desc: 'Enterprise-grade' },
              { label: 'Analytics', desc: 'Comprehensive reports' },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">{feature.label}</p>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 bg-surface-50">
        <motion.div
          variants={scaleVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900">Smart Attend</h1>
            <p className="text-surface-500">Sign in to your account</p>
          </div>

          <Card variant="elevated" padding="lg" className="w-full">
            <CardContent className="p-0">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-surface-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-surface-500">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error-700">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  leftIcon={<Mail className="w-5 h-5" />}
                  required
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-surface-600">Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  loadingText="Signing in..."
                  className="w-full"
                  rightIcon={<ShieldCheck className="w-5 h-5" />}
                >
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-surface-500">
                    Secure Connection
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <div className="text-center">
                <p className="text-xs text-surface-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" />
                  End-to-end encrypted session
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 space-y-3">
            <p className="text-center text-sm text-surface-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Create account
              </Link>
            </p>
            <p className="text-center text-xs text-surface-400">
              Need help?{' '}
              <a href="#" className="hover:text-surface-600 transition-colors">
                Contact support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
