/**
 * RegisterPage — Modern registration screen with role selection
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Card, CardContent } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import api from '@/api/axios';
import {
  GraduationCap,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  ArrowLeft,
  CheckCircle,
  Search,
  Mail,
  Lock,
  User,
  AlertCircle,
  Building2,
  GraduationCap as StudentIcon,
  Users,
  Shield,
} from 'lucide-react';
import { scaleVariants, fadeVariants } from '@/lib/animations';

type Role = 'HOD' | 'ADMIN' | 'FACULTY' | 'STUDENT';

const ROLE_OPTIONS: { value: Role; label: string; description: string; icon: any }[] = [
  {
    value: 'HOD',
    label: 'Head of Department',
    description: 'Manage department classes and approvals',
    icon: Building2
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'System management and enrollment approvals',
    icon: Shield
  },
  {
    value: 'FACULTY',
    label: 'Faculty',
    description: 'Take attendance and manage classes',
    icon: Users
  },
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'View attendance and enroll in classes',
    icon: StudentIcon
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [step, setStep] = useState<'select-role' | 'verify-email' | 'form' | 'success'>('select-role');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Whitelist check result
  const [whitelistChecked, setWhitelistChecked] = useState(false);
  const [whitelistName, setWhitelistName] = useState('');

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setWhitelistChecked(false);
    setWhitelistName('');
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    resetForm();
    if (role === 'FACULTY' || role === 'STUDENT') {
      setStep('verify-email');
    } else {
      setStep('form');
    }
  };

  const handleBack = () => {
    if (step === 'verify-email' || step === 'form') {
      setSelectedRole(null);
      setStep('select-role');
    } else {
      setStep('select-role');
    }
    resetForm();
  };

  // Whitelist email check for Faculty/Student
  const handleWhitelistCheck = async () => {
    if (!email) return setError('Please enter your email');
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/register/check-whitelist', { params: { email, role: selectedRole } });
      if (res.data.data.whitelisted) {
        setWhitelistChecked(true);
        setWhitelistName(res.data.data.fullName || '');
        setFullName(res.data.data.fullName || '');
        setStep('form');
      } else {
        setError('Your email is not on the approved list. Please contact your Admin.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      let res;
      if (selectedRole === 'HOD') {
        res = await api.post('/register/hod', { fullName, email, password });
      } else if (selectedRole === 'ADMIN') {
        res = await api.post('/register/admin', { fullName, email, password });
      } else {
        // FACULTY or STUDENT claim
        res = await api.post('/register/claim', { email, password, role: selectedRole });
      }
      setSuccessMessage(res.data.message || 'Registration successful!');
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label || '';

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
            Join Smart Attend<br />
            <span className="text-primary-200">Create Your Account</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/80 max-w-xl leading-relaxed"
          >
            Get started with our AI-powered attendance management system.
            Select your role and complete the registration process.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-6"
          >
            {[
              { label: 'Easy Setup', desc: 'Quick registration' },
              { label: 'Secure', desc: 'Enterprise security' },
              { label: 'Role-based', desc: 'Tailored access' },
              { label: '24/7 Support', desc: 'Always available' },
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

      {/* Right Side - Registration Form */}
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
            <p className="text-surface-500">Create your account</p>
          </div>

          <Card variant="elevated" padding="lg" className="w-full">
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {/* Step 1: Role Selection */}
                {step === 'select-role' && (
                  <motion.div
                    key="role-select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-surface-900 mb-2">
                        Select Your Role
                      </h2>
                      <p className="text-surface-500">
                        Choose the role that best describes you
                      </p>
                    </div>

                    <div className="space-y-3">
                      {ROLE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleRoleSelect(opt.value)}
                            className="w-full text-left p-4 rounded-xl border-2 border-surface-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <span className="block font-semibold text-surface-900">
                                  {opt.label}
                                </span>
                                <span className="block text-surface-500 text-sm mt-0.5">
                                  {opt.description}
                                </span>
                              </div>
                              <div className="w-6 h-6 rounded-full border-2 border-surface-300 group-hover:border-primary-500 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2a: Email Verification (Faculty/Student) */}
                {step === 'verify-email' && (
                  <motion.div
                    key="verify-email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 text-surface-500 hover:text-surface-700 text-sm mb-4 transition-colors"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>

                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-surface-900 mb-2">
                        Verify Your Email
                      </h2>
                      <p className="text-surface-500">
                        Enter your institutional email to verify your identity as {roleLabel}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@college.edu"
                        leftIcon={<Mail className="w-5 h-5" />}
                        onKeyDown={(e) => e.key === 'Enter' && handleWhitelistCheck()}
                      />

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-error-700">{error}</p>
                        </motion.div>
                      )}

                      <Button
                        onClick={handleWhitelistCheck}
                        disabled={loading}
                        isLoading={loading}
                        loadingText="Verifying..."
                        fullWidth
                        leftIcon={<Search className="w-5 h-5" />}
                      >
                        Verify Email
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2b / 3: Registration Form */}
                {step === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 text-surface-500 hover:text-surface-700 text-sm mb-4 transition-colors"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>

                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-surface-900 mb-2">
                        Register as {roleLabel}
                      </h2>
                      {whitelistChecked && whitelistName && (
                        <Badge variant="success" size="sm" className="mt-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified: {whitelistName}
                        </Badge>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Full Name (only for HoD/Admin) */}
                      {(selectedRole === 'HOD' || selectedRole === 'ADMIN') && (
                        <Input
                          label="Full Name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Dr. John Doe"
                          leftIcon={<User className="w-5 h-5" />}
                          required
                        />
                      )}

                      {/* Email (editable for HoD/Admin, read-only for claimed) */}
                      {(selectedRole === 'HOD' || selectedRole === 'ADMIN') && (
                        <Input
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={selectedRole === 'HOD' ? 'name@college.edu' : 'name@example.com'}
                          leftIcon={<Mail className="w-5 h-5" />}
                          required
                        />
                      )}

                      {/* Password */}
                      <div className="relative">
                        <Input
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          leftIcon={<Lock className="w-5 h-5" />}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Confirm Password */}
                      <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        leftIcon={<Lock className="w-5 h-5" />}
                        required
                      />

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-error-700">{error}</p>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        loadingText="Creating account..."
                        fullWidth
                        leftIcon={<UserPlus className="w-5 h-5" />}
                      >
                        Create Account
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-4"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-success-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-surface-900 mb-2">
                      Registration Successful!
                    </h2>
                    <p className="text-surface-600 mb-8">{successMessage}</p>
                    <Button
                      onClick={() => navigate('/login')}
                      fullWidth
                      leftIcon={<ShieldCheck className="w-5 h-5" />}
                    >
                      Go to Login
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 space-y-3">
            <p className="text-center text-sm text-surface-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs text-surface-400">
              By registering, you agree to our{' '}
              <a href="#" className="hover:text-surface-600 transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="hover:text-surface-600 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
