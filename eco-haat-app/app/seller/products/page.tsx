'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    material: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected';
    eco_rating: number | null;
    rejection_reason: string | null;
    created_at: string;
}

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setProducts(data as Product[]);
        }
        setIsLoading(false);
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        await supabase.from('products').delete().eq('id', productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/seller" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-2">
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-gray-900">My Products</h1>
                    </div>
                    <Link href="/seller/products/new">
                        <Button>
                            <Plus size={20} className="mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                        <p className="text-gray-500 mb-6">Start selling by adding your first eco-friendly product</p>
                        <Link href="/seller/products/new">
                            <Button>Add Your First Product</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card hover>
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-2xl">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <StatusBadge status={product.status} />
                                        </div>
                                    </div>
                                    <CardContent>
                                        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">৳{product.price} • {product.material}</p>

                                        {product.eco_rating && (
                                            <div className="text-sm text-primary-600 font-medium mb-3">
                                                🌿 Eco Score: {product.eco_rating}%
                                            </div>
                                        )}

                                        {product.status === 'rejected' && product.rejection_reason && (
                                            <div className="p-2 bg-red-50 rounded text-sm text-red-700 mb-3">
                                                <strong>Rejection reason:</strong> {product.rejection_reason}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {product.status === 'approved' && (
                                                <Link href={`/products/${product.id}`} className="flex-1">
                                                    <Button variant="ghost" size="sm" className="w-full">
                                                        <Eye size={16} className="mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
