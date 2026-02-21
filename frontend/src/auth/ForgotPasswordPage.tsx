/**
 * ForgotPasswordPage — Password recovery screen
 * Allows users to request a password reset via email
 */

import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Card, CardContent } from '@/components/primitives/Card';
import {
    GraduationCap,
    Mail,
    ArrowLeft,
    ShieldCheck,
    CheckCircle,
} from 'lucide-react';
import { scaleVariants, fadeVariants } from '@/lib/animations';

export default function ForgotPasswordPage() {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call — replace with actual backend call when ready
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800">
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
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                </div>

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
                        Account Recovery<br />
                        <span className="text-primary-200">Made Simple</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-white/80 max-w-xl leading-relaxed"
                    >
                        Enter your registered email address and we'll send you instructions
                        to reset your password securely.
                    </motion.p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
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
                        <p className="text-surface-500">Reset your password</p>
                    </div>

                    <Card variant="elevated" padding="lg" className="w-full">
                        <CardContent className="p-0">
                            {submitted ? (
                                /* Success State */
                                <div className="text-center py-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <CheckCircle className="w-8 h-8 text-success-600" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-surface-900 mb-2">
                                        Check Your Email
                                    </h2>
                                    <p className="text-surface-500 mb-6">
                                        We've sent password reset instructions to{' '}
                                        <span className="font-medium text-surface-700">{email}</span>.
                                        Please check your inbox and follow the link.
                                    </p>
                                    <p className="text-sm text-surface-400 mb-6">
                                        Didn't receive the email? Check your spam folder or try again.
                                    </p>
                                    <div className="space-y-3">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                            onClick={() => setSubmitted(false)}
                                        >
                                            Try Again
                                        </Button>
                                        <Link to="/login" className="block">
                                            <Button variant="ghost" size="lg" className="w-full">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Back to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                /* Form State */
                                <>
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-surface-900 mb-2">
                                            Forgot Password?
                                        </h2>
                                        <p className="text-surface-500">
                                            Enter your email address and we'll send you a link to reset
                                            your password.
                                        </p>
                                    </div>

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

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            isLoading={loading}
                                            loadingText="Sending..."
                                            fullWidth
                                            rightIcon={<ShieldCheck className="w-5 h-5" />}
                                        >
                                            Send Reset Link
                                        </Button>
                                    </form>

                                    {/* Back to Login */}
                                    <div className="mt-8 text-center">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </>
                            )}

                            {/* Security Info */}
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
