'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Users, ShoppingBag, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

interface Stats {
    pendingProducts: number;
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
}

interface PendingProduct {
    id: number;
    name: string;
    price: number;
    material: string;
    created_at: string;
    profiles: { full_name: string };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        pendingProducts: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
    });
    const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Get pending count
            const { count: pendingCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Get total products
            const { count: totalProducts } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Get total users
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Get total orders
            const { count: totalOrders } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true });

            setStats({
                pendingProducts: pendingCount || 0,
                totalProducts: totalProducts || 0,
                totalUsers: totalUsers || 0,
                totalOrders: totalOrders || 0,
            });

            // Get pending products
            const { data: pending } = await supabase
                .from('products')
                .select('*, profiles(full_name)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(5);

            if (pending) {
                setPendingProducts(pending as PendingProduct[]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: 'Pending Products', value: stats.pendingProducts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage products, users, and platform settings</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={stat.color} size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                        <div className="text-sm text-gray-500">{stat.label}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Pending Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
                                    <p className="text-sm text-gray-500">Products waiting for review</p>
                                </div>
                                <Link href="/admin/products">
                                    <Button variant="ghost" size="sm">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                                        ))}
                                    </div>
                                ) : pendingProducts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">✅</div>
                                        <p className="text-gray-500">No pending products</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        by {product.profiles?.full_name} • ৳{product.price}
                                                    </div>
                                                </div>
                                                <Link href={`/admin/products?review=${product.id}`}>
                                                    <Button size="sm">Review</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/admin/products" className="block">
                                    <div className="p-4 bg-amber-50 rounded-xl flex items-center gap-3 hover:bg-amber-100 transition-colors">
                                        <AlertCircle className="text-amber-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">Product Moderation</div>
                                            <div className="text-sm text-gray-500">Approve or reject products</div>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/admin/users" className="block">
                                    <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3 hover:bg-blue-100 transition-colors">
                                        <Users className="text-blue-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">User Management</div>
                                            <div className="text-sm text-gray-500">View all users</div>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/" className="block">
                                    <div className="p-4 bg-primary-50 rounded-xl flex items-center gap-3 hover:bg-primary-100 transition-colors">
                                        <TrendingUp className="text-primary-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">View Storefront</div>
                                            <div className="text-sm text-gray-500">See the public site</div>
                                        </div>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
