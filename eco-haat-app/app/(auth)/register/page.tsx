'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Store, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'buyer' as 'buyer' | 'seller',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Check if role is preset from URL
    useState(() => {
        const role = searchParams.get('role');
        if (role === 'seller') {
            setFormData(prev => ({ ...prev, role: 'seller' }));
        }
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            // Sign up
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (data.user) {
                // Create profile
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: formData.email,
                    full_name: formData.fullName,
                    role: formData.role,
                });

                if (profileError) {
                    // Profile might already exist from trigger, try update
                    await supabase.from('profiles').update({
                        full_name: formData.fullName,
                        role: formData.role,
                    }).eq('id', data.user.id);
                }

                // Redirect based on role
                if (formData.role === 'seller') {
                    router.push('/seller');
                } else {
                    router.push('/');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="text-4xl">🌿</span>
                            <span className="text-2xl font-display font-bold text-primary-800">Eco Haat</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-4">Join the Green Revolution</h1>
                        <p className="text-gray-500 mt-1">Create your eco-friendly account</p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                            className={`p-4 rounded-xl border-2 transition-all ${formData.role === 'buyer'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <ShoppingBag className={`mx-auto mb-2 ${formData.role === 'buyer' ? 'text-primary-600' : 'text-gray-400'}`} size={28} />
                            <div className={`font-medium ${formData.role === 'buyer' ? 'text-primary-700' : 'text-gray-600'}`}>Buyer</div>
                            <div className="text-xs text-gray-500 mt-1">Shop eco products</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
                            className={`p-4 rounded-xl border-2 transition-all ${formData.role === 'seller'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Store className={`mx-auto mb-2 ${formData.role === 'seller' ? 'text-primary-600' : 'text-gray-400'}`} size={28} />
                            <div className={`font-medium ${formData.role === 'seller' ? 'text-primary-700' : 'text-gray-600'}`}>Seller</div>
                            <div className="text-xs text-gray-500 mt-1">Sell eco products</div>
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2" size={20} />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-sm text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Login link */}
                    <p className="text-center text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Bottom text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    By signing up, you agree to our{' '}
                    <Link href="#" className="text-primary-600 hover:underline">Terms</Link>
                    {' '}and{' '}
                    <Link href="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
}
