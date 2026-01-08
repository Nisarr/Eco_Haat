'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Eye, Leaf, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
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
    created_at: string;
    profiles: { full_name: string; email: string };
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [ecoRating, setEcoRating] = useState(85);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data } = await query;
            if (data) {
                setProducts(data as Product[]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedProduct) return;
        setIsSubmitting(true);

        try {
            await supabase
                .from('products')
                .update({
                    status: 'approved',
                    eco_rating: ecoRating,
                })
                .eq('id', selectedProduct.id);

            setProducts(prev =>
                prev.map(p =>
                    p.id === selectedProduct.id
                        ? { ...p, status: 'approved', eco_rating: ecoRating }
                        : p
                )
            );
            setSelectedProduct(null);
            setEcoRating(85);
        } catch (error) {
            console.error('Error approving product:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedProduct) return;
        setIsSubmitting(true);

        try {
            await supabase
                .from('products')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                })
                .eq('id', selectedProduct.id);

            setProducts(prev =>
                prev.map(p =>
                    p.id === selectedProduct.id
                        ? { ...p, status: 'rejected' }
                        : p
                )
            );
            setSelectedProduct(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting product:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-2">
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-gray-900">Product Moderation</h1>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-xl font-medium capitalize transition-colors ${filter === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">No {filter === 'all' ? '' : filter} products to display</p>
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
                                        <p className="text-sm text-gray-500 mb-2">
                                            by {product.profiles?.full_name} • ৳{product.price}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>

                                        {product.status === 'pending' ? (
                                            <Button
                                                className="w-full"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                <Eye size={18} className="mr-2" />
                                                Review Product
                                            </Button>
                                        ) : product.eco_rating ? (
                                            <div className="flex items-center gap-2 text-primary-600">
                                                <Leaf size={18} />
                                                <span className="font-medium">Eco Score: {product.eco_rating}%</span>
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Product Info */}
                            <div className="p-6 border-b">
                                <div className="flex gap-4">
                                    <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {selectedProduct.images?.[0] ? (
                                            <img
                                                src={selectedProduct.images[0]}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                                        <p className="text-gray-500 mt-1">by {selectedProduct.profiles?.full_name}</p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="text-primary-600 font-medium">৳{selectedProduct.price}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-600">{selectedProduct.material}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-3 line-clamp-3">{selectedProduct.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Eco Rating Input */}
                            <div className="p-6 border-b">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Leaf className="text-primary-500" size={20} />
                                    Assign Eco-Friendliness Rating
                                </h4>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={ecoRating}
                                        onChange={(e) => setEcoRating(Number(e.target.value))}
                                        className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    />
                                    <div className="w-20 text-center">
                                        <span className="text-2xl font-bold text-primary-600">{ecoRating}%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            <div className="p-6 border-b">
                                <h4 className="font-semibold text-gray-900 mb-4">Rejection Reason (if rejecting)</h4>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this product is being rejected..."
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                    rows={3}
                                />
                            </div>

                            {/* Actions */}
                            <div className="p-6 flex gap-4">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setSelectedProduct(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1"
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <X size={18} />}
                                    <span className="ml-2">Reject</span>
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleApprove}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                                    <span className="ml-2">Approve</span>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
