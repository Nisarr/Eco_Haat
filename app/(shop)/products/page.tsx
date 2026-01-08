'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { EcoRating } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    material: string;
    images: string[];
    eco_rating: number;
    category_id: number;
    profiles: { full_name: string };
    categories: { name: string };
}

const materials = [
    { value: '', label: 'All Materials' },
    { value: 'Paper', label: '📄 Paper' },
    { value: 'Bamboo', label: '🎋 Bamboo' },
    { value: 'Clay', label: '🏺 Clay' },
    { value: 'Jute', label: '🧵 Jute' },
    { value: 'Wood', label: '🪵 Wood' },
    { value: 'Cotton', label: '👕 Cotton' },
    { value: 'Other', label: '🌿 Other' },
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [material, setMaterial] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        const category = searchParams.get('category');
        fetchProducts(category);
    }, [searchParams, material, sortBy]);

    const fetchProducts = async (category: string | null) => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*, profiles(full_name), categories(name)')
                .eq('status', 'approved');

            if (material) {
                query = query.ilike('material', `%${material}%`);
            }

            if (sortBy === 'newest') {
                query = query.order('created_at', { ascending: false });
            } else if (sortBy === 'price_low') {
                query = query.order('price', { ascending: true });
            } else if (sortBy === 'price_high') {
                query = query.order('price', { ascending: false });
            } else if (sortBy === 'eco_rating') {
                query = query.order('eco_rating', { ascending: false });
            }

            const { data, error } = await query;

            if (data) {
                let filteredData = data;
                if (search) {
                    filteredData = data.filter(p =>
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.description?.toLowerCase().includes(search.toLowerCase())
                    );
                }
                setProducts(filteredData as Product[]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            {/* Header */}
            <div className="bg-gradient-hero text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Explore Eco-Friendly Products
                        </h1>
                        <p className="text-primary-100 max-w-2xl mx-auto">
                            Discover sustainable products handcrafted with care for you and the planet
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8"
                >
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                            />
                        </div>

                        {/* Material filter */}
                        <div className="relative">
                            <select
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                                className="appearance-none bg-white pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none cursor-pointer"
                            >
                                {materials.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="eco_rating">Highest Eco Rating</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>

                        {/* View toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🌿</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                        <Button onClick={() => { setSearch(''); setMaterial(''); }}>
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid md:grid-cols-2 lg:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }>
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/products/${product.id}`}>
                                    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-eco transition-all duration-300 group ${viewMode === 'list' ? 'flex' : ''
                                        }`}>
                                        <div className={`${viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'} bg-gray-100 relative overflow-hidden`}>
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
                                            )}
                                            {product.eco_rating && (
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-primary-700">
                                                    🌿 {product.eco_rating}%
                                                </div>
                                            )}
                                        </div>
                                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                                            <div className="text-xs text-primary-600 font-medium mb-1">{product.material}</div>
                                            <h5 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h5>
                                            <p className="text-sm text-gray-500 mb-2 truncate">{product.profiles?.full_name || 'Eco Seller'}</p>
                                            {viewMode === 'list' && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-primary-600">৳{product.price}</span>
                                                {product.eco_rating && viewMode === 'list' && (
                                                    <EcoRating score={product.eco_rating} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
