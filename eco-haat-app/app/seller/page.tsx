'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Plus, ShoppingBag, Clock, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

interface Stats {
    totalProducts: number;
    pendingProducts: number;
    approvedProducts: number;
    totalOrders: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    status: 'pending' | 'approved' | 'rejected';
    eco_rating: number | null;
    created_at: string;
}

export default function SellerDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        pendingProducts: 0,
        approvedProducts: 0,
        totalOrders: 0,
    });
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get product counts
            const { count: total } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', user.id);

            const { count: pending } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', user.id)
                .eq('status', 'pending');

            const { count: approved } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', user.id)
                .eq('status', 'approved');

            // Get orders with seller's products
            const { data: orders } = await supabase
                .from('order_items')
                .select('*, products!inner(seller_id)')
                .eq('products.seller_id', user.id);

            setStats({
                totalProducts: total || 0,
                pendingProducts: pending || 0,
                approvedProducts: approved || 0,
                totalOrders: orders?.length || 0,
            });

            // Get recent products
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (products) {
                setRecentProducts(products as Product[]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Pending', value: stats.pendingProducts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Approved', value: stats.approvedProducts, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-start mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900">Seller Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage your eco-friendly products and orders</p>
                    </div>
                    <Link href="/seller/products/new">
                        <Button>
                            <Plus size={20} className="mr-2" />
                            Add Product
                        </Button>
                    </Link>
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

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Products */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
                                    <p className="text-sm text-gray-500">Your latest product listings</p>
                                </div>
                                <Link href="/seller/products">
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
                                ) : recentProducts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📦</div>
                                        <p className="text-gray-500 mb-4">No products yet</p>
                                        <Link href="/seller/products/new">
                                            <Button size="sm">Add Your First Product</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">৳{product.price}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {product.eco_rating && (
                                                        <span className="text-sm text-primary-600 font-medium">
                                                            🌿 {product.eco_rating}%
                                                        </span>
                                                    )}
                                                    <StatusBadge status={product.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
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
                                <Link href="/seller/products/new" className="block">
                                    <div className="p-4 bg-primary-50 rounded-xl flex items-center gap-3 hover:bg-primary-100 transition-colors">
                                        <Plus className="text-primary-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">Add New Product</div>
                                            <div className="text-sm text-gray-500">List a new eco product</div>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/seller/products" className="block">
                                    <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3 hover:bg-blue-100 transition-colors">
                                        <Package className="text-blue-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">Manage Products</div>
                                            <div className="text-sm text-gray-500">Edit or remove products</div>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/seller/orders" className="block">
                                    <div className="p-4 bg-purple-50 rounded-xl flex items-center gap-3 hover:bg-purple-100 transition-colors">
                                        <ShoppingBag className="text-purple-600" />
                                        <div>
                                            <div className="font-medium text-gray-900">View Orders</div>
                                            <div className="text-sm text-gray-500">Check incoming orders</div>
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
