'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    role: 'admin' | 'seller' | 'buyer';
}

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Check auth state
        const getUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    setUser(profile as UserProfile);
                }

                // Get cart count
                const { count } = await supabase
                    .from('cart_items')
                    .select('*', { count: 'exact', head: true })
                    .eq('buyer_id', authUser.id);

                setCartCount(count || 0);
            }
        };

        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setCartCount(0);
            } else if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUser(profile as UserProfile);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin';
            case 'seller': return '/seller';
            default: return '/';
        }
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/#categories', label: 'Categories' },
        { href: '/#about', label: 'About' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🌿</span>
                        <span className={`text-xl md:text-2xl font-display font-bold ${isScrolled ? 'text-primary-800' : 'text-white'
                            }`}>
                            Eco Haat
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`font-medium transition-colors ${isScrolled
                                        ? 'text-gray-700 hover:text-primary-600'
                                        : 'text-white/90 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/cart"
                            className={`relative p-2 rounded-full transition-colors ${isScrolled
                                    ? 'text-gray-700 hover:bg-gray-100'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href={getDashboardLink()}>
                                    <Button variant="ghost" size="sm" className={isScrolled ? '' : 'text-white hover:bg-white/10'}>
                                        <LayoutDashboard size={18} className="mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={`p-2 rounded-full transition-colors ${isScrolled
                                            ? 'text-gray-700 hover:bg-gray-100'
                                            : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className={isScrolled ? '' : 'text-white hover:bg-white/10'}>
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Join Now</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <X size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
                        ) : (
                            <Menu size={24} className={isScrolled ? 'text-gray-900' : 'text-white'} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t shadow-lg"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-4" />
                            {user ? (
                                <>
                                    <Link
                                        href={getDashboardLink()}
                                        className="block py-2 text-gray-700 hover:text-primary-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left py-2 text-red-600"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button variant="secondary" className="w-full">Login</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full">Join Now</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
